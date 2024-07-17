package api

import (
	"bytes"
	_ "embed"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"sort"
	"strings"
	"text/template"

	"github.com/iancoleman/strcase"
	"github.com/zeromicro/goctl-tool/core/api/types"
	"github.com/zeromicro/goctl-tool/core/parser/api/format"
	"github.com/zeromicro/goctl-tool/core/placeholder"
	"github.com/zeromicro/goctl-tool/core/sortmap"
	"github.com/zeromicro/goctl-tool/core/stringx"
	"github.com/zeromicro/goctl-tool/core/typex"
	"github.com/zeromicro/goctl-tool/core/writer"
)

var (
	//go:embed tpl/api.api
	apiTemplate string
	//go:embed tpl/field.tpl
	filedTemplate string

	errMissingServiceName = errors.New("missing service name")
	errMissingRouteGroups = errors.New("missing route groups")
)

func Generate(req *types.APIGenerateRequest) (resp *types.APIGenerateResponse, err error) {
	if err := validateAPIGenerateRequest(req); err != nil {
		return nil, err
	}
	mergedReq := mergeGroup(req)
	var data []KV
	for _, group := range mergedReq.List {
		var groupData = KV{}
		var hasServer bool
		var server = KV{}
		if group.Jwt {
			hasServer = true
			server["jwt"] = group.Jwt
		}
		if len(group.Prefix) > 0 {
			hasServer = true
			server["prefix"] = group.Prefix
		}
		if len(group.Group) > 0 {
			hasServer = true
			server["group"] = group.Group
		}
		if group.Timeout > 0 {
			hasServer = true
			server["timeout"] = fmt.Sprintf("%dms", group.Timeout)
		}
		if len(group.Middleware) > 0 {
			hasServer = true
			server["middleware"] = group.Middleware
		}
		if group.MaxBytes > 0 {
			hasServer = true
			server["maxBytes"] = group.MaxBytes
		}

		if hasServer {
			groupData["server"] = server
		}

		var routesData []KV
		for _, route := range group.Routes {
			var request, response string
			if len(route.RequestBody) > 0 {
				request = generateTypeName(route, true)
			}
			if !stringx.IsWhiteSpace(route.ResponseBody) {
				response = generateTypeName(route, false)
			}
			routesData = append(routesData, KV{
				"handlerName": generateHandlerName(route),
				"method":      strings.ToLower(route.Method),
				"path":        route.Path,
				"request":     request,
				"response":    response,
			})
		}
		var service = KV{
			"name":   req.Name,
			"routes": routesData,
		}
		groupData["service"] = service
		data = append(data, groupData)
	}

	t, err := template.New("api").Funcs(map[string]any{
		"lessThan": func(idx int, length int) bool {
			return idx < length-1
		},
	}).Parse(apiTemplate)
	if err != nil {
		return nil, err
	}

	tps, err := generateTypes(mergedReq.List)
	if err != nil {
		return nil, err
	}

	var typeString string
	if len(tps) > 0 {
		typeString = strings.Join(tps, "\n\n")
	}

	w := bytes.NewBuffer(nil)
	err = t.Execute(w, map[string]any{
		"types":  typeString,
		"groups": data,
	})
	if err != nil {
		return nil, err
	}

	formatWriter := bytes.NewBuffer(nil)
	err = format.Source(w.Bytes(), formatWriter)
	if err != nil {
		return nil, err
	}

	return &types.APIGenerateResponse{
		API: formatWriter.String(),
	}, nil
}

func generateTypes(groups []*types.APIRouteGroup) ([]string, error) {
	var resp []string
	for _, group := range groups {
		var groupTypes []string
		for _, route := range group.Routes {
			tp, err := generateType(route)
			if err != nil {
				return nil, err
			}
			if len(tp) > 0 {
				groupTypes = append(groupTypes, tp...)
			}
		}
		if len(groupTypes) > 0 {
			resp = append(resp, fmt.Sprintf("type(\n%s\n)", strings.Join(groupTypes, "\n\n")))
		}
	}
	return resp, nil
}

func generateType(route *types.APIRoute) ([]string, error) {
	var requestTypes []string
	if len(route.RequestBody) > 0 {
		isMethodPost := strings.EqualFold(route.Method, http.MethodPost)
		postJson := isMethodPost && route.ContentType == applicationJSON
		requestTypeName := generateTypeName(route, true)
		requestType, err := generateRequestType(requestTypeName, postJson, route.RequestBody)
		if err != nil {
			return nil, err
		}
		if len(requestType) > 0 {
			requestTypes = append(requestTypes, requestType)
		}
	}

	responseTypeName := generateTypeName(route, false)
	responseType, err := generateResponseType(responseTypeName, route.ResponseBody)
	if err != nil {
		return nil, err
	}
	if len(responseType) > 0 {
		requestTypes = append(requestTypes, responseType)
	}
	return requestTypes, nil
}

func generateRequestType(typeName string, postJSON bool, form []*types.FormItem) (string, error) {
	t, err := template.New("field").Funcs(map[string]any{
		"camel": func(s string) string {
			return strcase.ToCamel(s)
		},
	}).Parse(filedTemplate)
	if err != nil {
		return "", err
	}

	fieldsWriter := writer.New("")
	fieldWriter := bytes.NewBuffer(nil)
	for _, item := range form {
		fieldWriter.Reset()
		var rangeValue, enumValue string
		if item.CheckEnum == checkTypeRange &&
			item.LowerBound != item.UpperBound {
			rangeExpr := formatRange(item.LowerBound, item.UpperBound)
			rangeValue = fmt.Sprintf("range=%s", rangeExpr)
		}
		if item.CheckEnum == checkTypeEnum {
			enumValue = item.EnumValue
		}
		err = t.Execute(fieldWriter, map[string]any{
			"name":         item.Name,
			"type":         item.Type,
			"json":         postJSON,
			"optional":     item.Optional,
			"defaultValue": item.DefaultValue,
			"checkEnum":    item.CheckEnum == checkTypeEnum,
			"enumValue":    enumValue,
			"rangeValue":   rangeValue,
		})
		if err != nil {
			return "", err
		}
		fieldsWriter.WriteStringln(fieldWriter.String())
	}

	return fmt.Sprintf("%s {\n%s\n}", typeName, fieldsWriter.String()), nil
}

func formatRange(lowerBound, upperBound int64) string {
	if lowerBound == -1 {
		return fmt.Sprintf("[:%d]", upperBound)
	}
	if upperBound == -1 {
		return fmt.Sprintf("[%d:]", lowerBound)
	}
	return fmt.Sprintf("[%d:%d]", lowerBound, upperBound)
}

func generateResponseType(typeName, s string) (string, error) {
	if stringx.IsWhiteSpace(s) {
		return "", nil
	}

	var v any
	if err := json.Unmarshal([]byte(s), &v); err != nil {
		return "", err
	}

	tps, _, err := json2APIType(json2APITypeReq{
		root:        true,
		indentCount: 1,
		typeName:    typeName,
		v:           v,
	})

	return tps, err
}

func json2APIType(req json2APITypeReq) (tp string, externalTypes []string, err error) {
	typeName := strcase.ToCamel(req.parentTypeName) + strcase.ToCamel(req.typeName)
	kv, ok := req.v.(map[string]any)
	if !ok {
		return "", nil, fmt.Errorf("input must be object, got %T", req.v)
	}

	// ensure fields sorted stable.
	sm := sortmap.From(kv)
	typeWriter := writer.New(getIdent(req.indentCount))
	typeWriter.WriteWithIndentStringf("%s {\n", typeName)
	if len(kv) == 0 {
		typeWriter.UndoNewLine()
		typeWriter.Writef("}")
		return typeWriter.String(), nil, nil
	}

	var externalTypeList []string
	memberWriter := writer.New(getIdent(req.indentCount + 1))
	err = sm.Range(func(_ int, key string, value any) error {
		result, err := convertGoctlAPIMemberType(req.indentCount+1, typeName, key, value)
		if err != nil {
			return err
		}
		externalTypeList = append(externalTypeList, result.ExternalTypeExpr...)
		if result.IsStruct {
			externalTypeList = append(externalTypeList, result.TypeExpr)
		}
		if result.IsArray {
			memberWriter.WriteWithIndentStringf("%s []%s `json:\"%s\"`\n", strcase.ToCamel(key), result.TypeName, key)
		} else {
			memberWriter.WriteWithIndentStringf("%s %s `json:\"%s\"`\n", strcase.ToCamel(key), result.TypeName, key)
		}
		return nil
	})
	if err != nil {
		return "", nil, err
	}

	typeWriter.Writef(memberWriter.String())
	typeWriter.WriteWithIndentStringf("}")

	if req.root {
		typeWriter.NewLine()
		typeWriter.WriteStringln(strings.Join(externalTypeList, "\n\n"))
	}

	return typeWriter.String(), externalTypeList, nil
}

func convertGoctlAPIMemberType(indentCount int, parent, key string, value any) (*goctlAPIMemberResult, error) {
	resp := new(goctlAPIMemberResult)
	switch {
	case typex.IsInteger(value):
		resp.TypeExpr = typeInt64
		resp.TypeName = typeInt64
		return resp, nil
	case typex.IsFloat(value):
		resp.TypeExpr = typeFloat64
		resp.TypeName = typeFloat64
		return resp, nil
	case typex.IsBool(value):
		resp.TypeExpr = typeBool
		resp.TypeName = typeBool
		return resp, nil
	case typex.IsTime(value):
		resp.TypeExpr = typeString
		resp.TypeName = typeString
		return resp, nil
	case typex.IsString(value):
		resp.TypeExpr = typeString
		resp.TypeName = typeString
		return resp, nil
	case typex.IsNil(value):
		resp.TypeExpr = typeInterface
		resp.TypeName = typeInterface
		return resp, nil
	default:
		_, ok := value.(map[string]any)
		if ok {
			tp, externalTypes, err := json2APIType(json2APITypeReq{
				indentCount:    indentCount,
				parentTypeName: parent,
				typeName:       key,
				v:              value,
			})
			if err != nil {
				return nil, err
			}
			resp.TypeExpr = tp
			resp.TypeName = "*" + strcase.ToCamel(parent) + strcase.ToCamel(key)
			resp.IsStruct = true
			resp.ExternalTypeExpr = append(resp.ExternalTypeExpr, externalTypes...)
			return resp, nil
		}
		list, ok := value.([]any)
		if !ok {
			return nil, fmt.Errorf("unsupport type, got %T", value)
		}
		if len(list) == 0 {
			resp.TypeExpr = "interface{}"
			resp.TypeName = "interface{}"
			resp.IsArray = true
			return resp, nil
		}
		first := list[0]
		_, ok = first.(map[string]any)
		if ok {
			var memberSet = make(map[string]any)
			for _, v := range list {
				m, ok := v.(map[string]any)
				if !ok {
					continue
				}
				for k, v := range m {
					memberSet[k] = v
				}
			}
			tp, externalTypes, err := json2APIType(json2APITypeReq{
				indentCount:    indentCount,
				parentTypeName: parent,
				typeName:       key,
				v:              memberSet,
			})
			if err != nil {
				return nil, err
			}
			resp.TypeExpr = tp
			resp.TypeName = "*" + strcase.ToCamel(parent) + strcase.ToCamel(key)
			resp.IsStruct = true
			resp.IsArray = true
			resp.ExternalTypeExpr = append(resp.ExternalTypeExpr, externalTypes...)
			return resp, nil
		}
		result, err := convertGoctlAPIMemberType(indentCount, parent, key, first)
		if err != nil {
			return nil, err
		}
		resp.TypeExpr = result.TypeExpr
		resp.TypeName = result.TypeName
		resp.IsStruct = result.IsStruct
		resp.IsArray = true
		resp.ExternalTypeExpr = append(resp.ExternalTypeExpr, result.ExternalTypeExpr...)
		return resp, nil
	}
}

func getIdent(c int) string {
	var list []string
	for i := 0; i < c; i++ {
		list = append(list, indent)
	}
	return strings.Join(list, "")
}

func generateTypeName(route *types.APIRoute, req bool) string {
	handlerName := generateHandlerName(route)
	if req {
		return handlerName + "Request"
	}
	return handlerName + "Response"
}

func generateHandlerName(route *types.APIRoute) string {
	if len(route.Handler) > 0 {
		return strings.Title(route.Handler)
	}
	if route.Path == "/" {
		return "Default"
	}

	r := strings.NewReplacer("/", "_", ":", "by_")
	formatedPath := r.Replace(route.Path)
	return strcase.ToCamel(route.Method + "_" + formatedPath)
}

func mergeGroup(req *types.APIGenerateRequest) *types.APIGenerateRequest {
	routeGroup := sortmap.New[RouteGroup, *types.APIRouteGroup]()
	for _, group := range req.List {
		middlewares := strings.Split(group.Middleware, ",")
		sort.Strings(middlewares)
		middleware := strings.Join(middlewares, ", ")
		routeGroupStruct := RouteGroup{
			Jwt:        group.Jwt,
			Prefix:     group.Prefix,
			Group:      group.Group,
			Timeout:    group.Timeout,
			Middleware: middleware,
			MaxBytes:   group.MaxBytes,
		}
		existGroup, ok := routeGroup.Get(routeGroupStruct)
		if ok {
			existGroup.Routes = appendAndMergeRoute(existGroup.Routes, group.Routes)
			routeGroup.Set(routeGroupStruct, existGroup)
		} else {
			routeGroup.Set(routeGroupStruct, &types.APIRouteGroup{
				Jwt:        group.Jwt,
				Prefix:     group.Prefix,
				Group:      group.Group,
				Timeout:    group.Timeout,
				Middleware: middleware,
				MaxBytes:   group.MaxBytes,
				Routes:     group.Routes,
			})
		}
	}

	var resp = types.APIGenerateRequest{
		Name: req.Name,
	}
	routeGroup.MustRange(func(idx int, key RouteGroup, value *types.APIRouteGroup) {
		resp.List = append(resp.List, value)
	})

	return &resp
}

func appendAndMergeRoute(header, tailer []*types.APIRoute) []*types.APIRoute {
	routeMap := sortmap.New[APIRoute, *types.APIRoute]()
	for _, route := range header {
		key := convertRoute(route)
		routeMap.Set(key, route)
	}

	for _, route := range tailer {
		key := convertRoute(route)
		ok := routeMap.HasKey(key)
		if !ok {
			routeMap.Set(key, route)
		}
	}

	var list []*types.APIRoute
	routeMap.MustRange(func(idx int, key APIRoute, value *types.APIRoute) {
		list = append(list, value)
	})

	return list
}

func convertRoute(route *types.APIRoute) APIRoute {
	var requestBody []types.FormItem
	for _, v := range route.RequestBody {
		requestBody = append(requestBody, *v)
	}
	return APIRoute{ // ignore request & response
		Handler:     route.Handler,
		Method:      route.Method,
		Path:        route.Path,
		ContentType: route.ContentType,
	}
}

func validateAPIGenerateRequest(req *types.APIGenerateRequest) error {
	if stringx.IsWhiteSpace(req.Name) {
		return errMissingServiceName
	}
	if len(req.List) == 0 {
		return errMissingRouteGroups
	}

	var err []string
	for idx, group := range req.List {
		if len(group.Routes) == 0 {
			if len(group.Group) > 0 {
				err = append(err, fmt.Sprintf("group %q: missing routes", group.Group))
			} else {
				err = append(err, fmt.Sprintf("group%d: missing routes", idx+1))
			}
		}
	}

	// generate handler

	var (
		handlerDuplicateCheck = make(map[string]placeholder.Type)
		routeDuplicateCheck   = make(map[string]placeholder.Type)
	)

	for idx, group := range req.List {
		for _, route := range group.Routes {
			var handlerUniqueValue, routeUniqueValue string
			if len(group.Group) > 0 {
				if stringx.IsNotWhiteSpace(route.Handler) {
					handlerUniqueValue = fmt.Sprintf("%s/%s", group.Group, route.Handler)
				}
				routeUniqueValue = fmt.Sprintf("%s/%s:%s/%s", group.Group, route.Method, group.Prefix, route.Path)
			} else {
				if stringx.IsNotWhiteSpace(route.Handler) {
					handlerUniqueValue = fmt.Sprintf("group[%d]/%s", idx, route.Handler)
				}
				routeUniqueValue = fmt.Sprintf("group[%d]/%s:%s/%s", idx, route.Method, group.Prefix, route.Path)
			}

			if len(handlerUniqueValue) > 0 {
				if _, ok := handlerDuplicateCheck[handlerUniqueValue]; ok {
					err = append(err, fmt.Sprintf("duplicate handler: %q", handlerUniqueValue))
				}
				handlerDuplicateCheck[handlerUniqueValue] = placeholder.PlaceHolder
			}

			if _, ok := routeDuplicateCheck[routeUniqueValue]; ok {
				err = append(err, fmt.Sprintf("duplicate route: %q", routeUniqueValue))
			}
			routeDuplicateCheck[routeUniqueValue] = placeholder.PlaceHolder
		}
	}

	if len(err) == 0 {
		return nil
	}

	return errors.New(strings.Join(err, "\n"))
}

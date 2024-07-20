package types

type APIRouteGroup struct {
	Jwt        bool        `json:"jwt,omitempty,optional"`
	Prefix     string      `json:"prefix,omitempty,optional"`
	Group      string      `json:"group,omitempty,optional"`
	Timeout    int         `json:"timeout,omitempty,optional,range=[0:]"`
	Middleware string      `json:"middleware,omitempty,optional"`
	MaxBytes   int64       `json:"maxBytes,omitempty,optional,range=[0:]"`
	Routes     []*APIRoute `json:"routes,omitempty"`
}

type APIRoute struct {
	Handler      string      `json:"handler,omitempty,optional"`
	Method       string      `json:"method,options=get|head|post|put|patch|delete|connect|options|trace"`
	Path         string      `json:"path"`
	TagTemplate  string      `json:"tagTemplate,omitempty,optional"`
	RequestBody  []*FormItem `json:"requestBodyFields,omitempty,optional"`
	ResponseBody string      `json:"responseBody,omitempty,optional"`
}

type APIGenerateRequest struct {
	Name string           `json:"serviceName"`
	List []*APIRouteGroup `json:"routeGroups"`
}

type APIGenerateResponse struct {
	API string `json:"api"`
}

type FormItem struct {
	Name         string `json:"name"`
	Type         string `json:"type"`
	Optional     bool   `json:"optional,optional,omitempty"`
	DefaultValue string `json:"defaultValue,optional,omitempty"`
	EnumValue    string `json:"enumValue,optional,omitempty"`
	LowerBound   int64  `json:"lowerBound,optional,omitempty"`
	UpperBound   int64  `json:"upperBound,optional,omitempty"`
}

type ParseJsonRequest struct {
	JSON string `json:"json"`
}

type ParseJsonResponse struct {
	Form []*FormItem `json:"form"`
}

type TagDataRequest struct {
	Template     string `json:"template"`
	Type         string `json:"type,omitempty,optional"`
	Name         string `json:"name"`
	Optional     bool   `json:"optional,omitempty,optional"`
	DefaultValue string `json:"defaultValue,omitempty,optional"`
	IsNumber     bool   `json:"isNumber,omitempty,optional"`
	EnumValue    string `json:"enumValue,omitempty,optional"`
	LowerBound   int64  `json:"lowerBound,omitempty,optional"`
	UpperBound   int64  `json:"upperBound,omitempty,optional"`
}

type TagDataResponse struct {
	Tag string `json:"tag"`
}

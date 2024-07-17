package api

import (
	"encoding/json"
	"io"
	"net/http"

	"github.com/zeromicro/goctl-tool/core/api"
	"github.com/zeromicro/goctl-tool/core/api/types"
	xhttp "github.com/zeromicro/x/http"
)

func RequestBodyParse(w http.ResponseWriter, r *http.Request) {
	var req types.ParseJsonRequest
	if err := parse(r, &req); err != nil {
		xhttp.JsonBaseResponseCtx(r.Context(), w, err)
		return
	}

	resp, err := api.RequestBodyParse(&req)
	if err != nil {
		xhttp.JsonBaseResponseCtx(r.Context(), w, err)
	} else {
		xhttp.JsonBaseResponseCtx(r.Context(), w, resp)
	}
}

func parse(r *http.Request, v any) error {
	data, err := io.ReadAll(r.Body)
	if err != nil {
		return err
	}
	return json.Unmarshal(data, v)
}

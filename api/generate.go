package api

import (
	"net/http"

	"github.com/zeromicro/goctl-tool/core/api"
	"github.com/zeromicro/goctl-tool/core/api/types"
	xhttp "github.com/zeromicro/x/http"
)

func Generate(w http.ResponseWriter, r *http.Request) {
	var req types.APIGenerateRequest
	if err := parse(r, &req); err != nil {
		xhttp.JsonBaseResponseCtx(r.Context(), w, err)
		return
	}

	resp, err := api.Generate(&req)
	if err != nil {
		xhttp.JsonBaseResponseCtx(r.Context(), w, err)
	} else {
		xhttp.JsonBaseResponseCtx(r.Context(), w, resp)
	}
}

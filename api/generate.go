package api

import (
	"net/http"

	"github.com/zeromicro/go-zero/rest/httpx"
	"github.com/zeromicro/goctl-tool-core/api"
	"github.com/zeromicro/goctl-tool-core/api/types"
	xhttp "github.com/zeromicro/x/http"
)

func Generate(w http.ResponseWriter, r *http.Request) {
	var req types.APIGenerateRequest
	if err := httpx.Parse(r, &req); err != nil {
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

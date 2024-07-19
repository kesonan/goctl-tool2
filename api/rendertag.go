package api

import (
	"net/http"

	"github.com/zeromicro/go-zero/rest/httpx"
	"github.com/zeromicro/goctl-tool/core/api"
	"github.com/zeromicro/goctl-tool/core/api/types"
)

func RenderTag(w http.ResponseWriter, r *http.Request) {
	var req types.TagDataRequest
	if err := httpx.Parse(r, &req); err != nil {
		writeJson(w, err)
		return
	}

	resp, err := api.RenderTag(&req)
	if err != nil {
		writeJson(w, err)
	} else {
		writeJson(w, resp)
	}
}

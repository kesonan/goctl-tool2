package api

import (
	"net/http"

	"github.com/zeromicro/goctl-tool/core/api"
	"github.com/zeromicro/goctl-tool/core/api/types"
)

func Generate(w http.ResponseWriter, r *http.Request) {
	var req types.APIGenerateRequest
	if err := parse(r, &req); err != nil {
		writeJson(w, err)
		return
	}

	resp, err := api.Generate(&req)
	if err != nil {
		writeJson(w, err)
	} else {
		writeJson(w, resp)
	}
}

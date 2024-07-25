package api

import (
	"github.com/zeromicro/go-zero/rest/httpx"
	"github.com/zeromicro/goctl-tool/core/model"
	"net/http"
)

func Connect(w http.ResponseWriter, r *http.Request) {
	var req model.ConnectRequest
	if err := httpx.Parse(r, &req); err != nil {
		writeJson(w, err)
		return
	}

	resp, err := model.Connect(&req)
	if err != nil {
		writeJson(w, err)
	} else {
		writeJson(w, resp)
	}
}

package api

import (
	"github.com/zeromicro/go-zero/rest/httpx"
	"github.com/zeromicro/goctl-tool/core/model"
	"net/http"
)

func MysqlGen(w http.ResponseWriter, r *http.Request) {
	var req model.GenerateRequest
	if err := httpx.Parse(r, &req); err != nil {
		writeJson(w, err)
		return
	}

	resp, err := model.Generate(&req)
	if err != nil {
		writeJson(w, err)
	} else {
		writeJson(w, resp)
	}
}

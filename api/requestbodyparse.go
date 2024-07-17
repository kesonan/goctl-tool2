package api

import (
	"encoding/json"
	"io"
	"net/http"

	"github.com/zeromicro/goctl-tool/core/api"
	"github.com/zeromicro/goctl-tool/core/api/types"
)

type CodeMsg struct {
	Code int    `json:"code"`
	Msg  string `json:"msg"`
	Data any    `json:"data,omitempty"`
}

func RequestBodyParse(w http.ResponseWriter, r *http.Request) {
	var req types.ParseJsonRequest
	if err := parse(r, &req); err != nil {
		writeJson(w, err)
		return
	}

	resp, err := api.RequestBodyParse(&req)
	if err != nil {
		writeJson(w, err)
	} else {
		writeJson(w, resp)
	}
}

func writeJson(w http.ResponseWriter, v any) {
	var resp CodeMsg
	err, ok := v.(error)
	w.WriteHeader(http.StatusOK)
	if ok {
		resp.Code = -1
		resp.Msg = err.Error()
	} else {
		resp.Msg = "ok"
		resp.Data = v
	}

	data, err := json.Marshal(resp)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_, _ = w.Write(data)
}

func parse(r *http.Request, v any) error {
	data, err := io.ReadAll(r.Body)
	if err != nil {
		return err
	}
	return json.Unmarshal(data, v)
}

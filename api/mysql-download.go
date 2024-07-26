package api

import (
	"fmt"
	"github.com/zeromicro/go-zero/rest/httpx"
	"github.com/zeromicro/goctl-tool/core/model"
	"net/http"
	"os"
)

func MysqlDownload(w http.ResponseWriter, r *http.Request) {
	var req model.GenerateRequest
	if err := httpx.Parse(r, &req); err != nil {
		writeJson(w, err)
		return
	}

	err := model.Download(&req, func(zipFile string) error {
		file, err := os.Open(zipFile)
		if err != nil {
			return err
		}
		defer file.Close()

		fileInfo, err := file.Stat()
		if err != nil {
			return err
		}

		w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s", fileInfo.Name()))
		w.Header().Set("Content-Type", "application/zip")
		w.Header().Set("Content-Length", fmt.Sprintf("%d", fileInfo.Size()))

		http.ServeFile(w, r, zipFile)
		return nil
	})
	if err != nil {
		writeJson(w, err)
	}
}

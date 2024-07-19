package main

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
	"os"
	"path"
	"strings"

	"github.com/zeromicro/goctl-tool/api"
)

const (
	slash     = "/"
	rootPath  = "/"
	distDir   = "public"
	indexHtml = "index.html"
)

//go:embed public/*
var staticFiles embed.FS

// just for local testing.
func main() {
	subFS, err := fs.Sub(staticFiles, distDir)
	if err != nil {
		log.Fatal(err)
	}

	fileServer := http.FileServer(http.FS(subFS))

	http.Handle("/", fileServerHandler(subFS, fileServer))
	http.HandleFunc("/api/generate", api.Generate)
	http.HandleFunc("/api/rendertag", api.RenderTag)
	http.HandleFunc("/api/requestbodyparse", api.RequestBodyParse)
	if err := http.ListenAndServe(":2000", nil); err != nil {
		log.Fatal(err)
	}
}

func fileServerHandler(subFS fs.FS, fsHandler http.Handler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) { // default path
		filePath := path.Clean(r.URL.Path)
		if filePath == rootPath {
			filePath = indexHtml
		} else {
			filePath = strings.TrimPrefix(filePath, slash)
		}

		file, err := subFS.Open(filePath)
		switch {
		case err == nil:
			fsHandler.ServeHTTP(w, r)
			_ = file.Close()
			return
		case os.IsNotExist(err):
			r.URL.Path = "/" // all virtual routes in react app means visit index.html
			fsHandler.ServeHTTP(w, r)
			return
		default:
			http.Error(w, "not found", http.StatusNotFound)
			return
		}
	}
}

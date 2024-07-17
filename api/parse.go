package api

import (
	"encoding/json"
	"io"
	"net/http"
)

func parse(r *http.Request, v any) error {
	data, err := io.ReadAll(r.Body)
	if err != nil {
		return err
	}
	return json.Unmarshal(data, v)
}

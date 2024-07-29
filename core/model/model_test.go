package model

import (
	"github.com/stretchr/testify/assert"
	"testing"
)

func Test_formatDSN(t *testing.T) {
	req := &ConnectRequest{
		Host:     "localhost",
		Port:     3306,
		Username: "foo",
		Password: "bar",
	}
	got := req.formatDSN()
	assert.Equal(t, "foo:bar@tcp(localhost:3306)/information_schema?readTimeout=10s&writeTimeout=10s", got)
}

func TestGenerate(t *testing.T) {
	resp, err := Generate(&GenerateRequest{
		GetTablesRequest: GetTablesRequest{
			ConnectRequest: ConnectRequest{
				Host:     "localhost",
				Port:     3306,
				Username: "root",
				Password: "111111",
			},
			Schema: "go-zero",
		},
		Tables: []string{"user", "student"},
		Style:  "gozero",
		Cache:  true,
		Strict: true,
	})
	assert.NoError(t, err)
	assert.NotNil(t, resp)
}

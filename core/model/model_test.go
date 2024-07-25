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

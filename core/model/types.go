package model

import (
	"fmt"
	"github.com/go-sql-driver/mysql"
	"time"
)

type (
	ConnectRequest struct {
		Host     string `json:"host"`
		Port     int    `json:"port"`
		Username string `json:"username,optional"`
		Password string `json:"password,optional"`
	}

	ConnectResponse struct {
		Schemas []string `json:"schemas"`
	}

	GetTablesRequest struct {
		ConnectRequest
		Schema string `json:"schema"`
	}

	GetTablesResponse struct {
		Tables []string `json:"tables"`
	}

	GenerateRequest struct {
		GetTablesRequest
		Tables        []string `json:"tables"`
		Style         string   `json:"style,optional"`
		Cache         bool     `json:"cache,optional"`
		Strict        bool     `json:"strict,optional"`
		IgnoreColumns string   `json:"ignoreColumns,,optional"`
	}

	File struct {
		Name    string `json:"name"`
		Content string `json:"content"`
	}

	GenerateResponse struct {
		Files []*File `json:"files"`
	}
)

func (req *ConnectRequest) formatDSN() string {
	cfg := mysql.NewConfig()
	cfg.Net = "tcp"
	cfg.Addr = fmt.Sprintf("%s:%d", req.Host, req.Port)
	cfg.User = req.Username
	cfg.Passwd = req.Password
	cfg.DBName = schemaInformation
	cfg.ReadTimeout = 10 * time.Second
	cfg.WriteTimeout = 10 * time.Second
	return cfg.FormatDSN()
}

package model

import (
	"github.com/zeromicro/go-zero/core/stores/sqlx"
	"github.com/zeromicro/go-zero/tools/goctl/model/sql/model"
)

func Connect(req *ConnectRequest) (*ConnectResponse, error) {
	dsn := req.formatDSN()
	conn := sqlx.NewMysql(dsn)
	schema, err := getSchema(conn)
	if err != nil {
		return nil, err
	}
	return &ConnectResponse{
		Schemas: schema,
	}, nil
}

func GetTables(req *GetTablesRequest) (*GetTablesResponse, error) {
	dsn := req.formatDSN()
	conn := sqlx.NewMysql(dsn)
	m := model.NewInformationSchemaModel(conn)
	tables, err := m.GetAllTables(req.Schema)
	if err != nil {
		return nil, err
	}
	return &GetTablesResponse{
		Tables: tables,
	}, nil
}

package model

import "github.com/zeromicro/go-zero/core/stores/sqlx"

func getSchema(conn sqlx.SqlConn) ([]string, error) {
	sql := `SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('information_schema', 'mysql', 'performance_schema', 'sys')`
	var schema []string
	if err := conn.QueryRows(&schema, sql); err != nil {
		return nil, err
	}
	return schema, nil
}

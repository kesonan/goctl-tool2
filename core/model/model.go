package model

import (
	"errors"
	"github.com/zeromicro/go-zero/core/stores/sqlx"
	"github.com/zeromicro/go-zero/core/stringx"
	"github.com/zeromicro/go-zero/tools/goctl/config"
	"github.com/zeromicro/go-zero/tools/goctl/model/sql/gen"
	"github.com/zeromicro/go-zero/tools/goctl/model/sql/model"
	"github.com/zeromicro/goctl-tool/core/osx"
	"github.com/zeromicro/goctl-tool/core/zipx"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
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

func Generate(req *GenerateRequest) (*GenerateResponse, error) {
	if len(req.Tables) == 0 || len(req.Schema) == 0 {
		return &GenerateResponse{
			Files: []*File{},
		}, nil
	}

	dsn := req.formatDSN()
	conn := sqlx.NewMysql(dsn)
	m := model.NewInformationSchemaModel(conn)
	tables, err := m.GetAllTables(req.Schema)
	if err != nil {
		return nil, err
	}

	matchTables := make(map[string]*model.Table)
	for _, tableName := range tables {
		if !stringx.Contains(req.Tables, tableName) {
			continue
		}

		columnData, err := m.FindColumns(req.Schema, tableName)
		if err != nil {
			return nil, err
		}

		table, err := columnData.Convert()
		if err != nil {
			return nil, err
		}

		matchTables[tableName] = table
	}

	if len(matchTables) == 0 {
		return nil, errors.New("no tables matched")
	}

	var options []gen.Option
	if len(req.IgnoreColumns) > 0 {
		options = append(options, gen.WithIgnoreColumns(strings.FieldsFunc(req.IgnoreColumns, func(r rune) bool {
			return r == '|'
		})))
	}

	var files []*File
	err = osx.CreateTempDirAndDo("model", func(_, dir string) error {
		generator, err := gen.NewDefaultGenerator(dir, &config.Config{
			NamingFormat: req.Style,
		}, options...)
		if err != nil {
			return err
		}

		err = generator.StartFromInformationSchema(matchTables, req.Cache, req.Strict)
		if err != nil {
			return err
		}

		fileSystem := os.DirFS(dir)
		return fs.WalkDir(fileSystem, ".", func(path string, d fs.DirEntry, err error) error {
			if d.IsDir() {
				return nil
			}
			filename := filepath.Join(dir, path)
			data, err := os.ReadFile(filename)
			if err != nil {
				return err
			}

			files = append(files, &File{
				Name:    path,
				Content: string(data),
			})
			return nil
		})
	})

	if err != nil {
		return nil, err
	}

	return &GenerateResponse{
		Files: files,
	}, nil
}

func Download(req *GenerateRequest, getZip func(zipFile string) error) error {
	if len(req.Tables) == 0 || len(req.Schema) == 0 {
		return nil
	}

	dsn := req.formatDSN()
	conn := sqlx.NewMysql(dsn)
	m := model.NewInformationSchemaModel(conn)
	tables, err := m.GetAllTables(req.Schema)
	if err != nil {
		return err
	}

	matchTables := make(map[string]*model.Table)
	for _, tableName := range tables {
		if !stringx.Contains(req.Tables, tableName) {
			continue
		}

		columnData, err := m.FindColumns(req.Schema, tableName)
		if err != nil {
			return err
		}

		table, err := columnData.Convert()
		if err != nil {
			return err
		}

		matchTables[tableName] = table
	}

	if len(matchTables) == 0 {
		return errors.New("no tables matched")
	}

	var options []gen.Option
	if len(req.IgnoreColumns) > 0 {
		options = append(options, gen.WithIgnoreColumns(strings.FieldsFunc(req.IgnoreColumns, func(r rune) bool {
			return r == '|'
		})))
	}

	return osx.CreateTempDirAndDo("model", func(parent, dir string) error {
		generator, err := gen.NewDefaultGenerator(dir, &config.Config{
			NamingFormat: req.Style,
		}, options...)
		if err != nil {
			return err
		}

		err = generator.StartFromInformationSchema(matchTables, req.Cache, req.Strict)
		if err != nil {
			return err
		}

		base := filepath.Base(dir)
		if base == "." {
			base = "model"
		}
		zipFile := filepath.Join(parent, base+".zip")
		err = zipx.Create(dir, zipFile)
		if err != nil {
			return err
		}

		return getZip(zipFile)
	})
}

package api

import "github.com/zeromicro/goctl-tool/core/api/types"

func RenderTag(data *types.TagDataRequest) (*types.TagDataResponse, error) {
	val, err := renderTag(data)
	if err != nil {
		return nil, err
	}
	return &types.TagDataResponse{
		Tag: val,
	}, nil
}

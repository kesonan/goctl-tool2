import React from "react";
import { Button, Collapse, Flex, Form, Input, message, Typography } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import "./FormPanel.css";
import RouteGroupPanel from "./RouteGroupPanel";
import { ConverterIcon } from "../../../util/icon";
import { Http } from "../../../util/http";
import { RoutePanelData } from "./_defaultProps";

const { Title } = Typography;

interface FormPanelProps {
  onBuild?: (data: string) => void;
}

const FormPanel: React.FC<FormPanelProps> = (props) => {
  const [api, contextHolder] = message.useMessage();
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const onFinish = (obj: any) => {
    Http.Build(
      obj,
      (data) => {
        if (props.onBuild) {
          props.onBuild(data);
        }
        api.open({
          type: "success",
          content: t("buildSuccess"),
        });
      },
      (err) => {
        api.open({
          type: "error",
          content: err,
        });
      },
    );
  };
  return (
    <Form
      name="basic"
      autoComplete="off"
      className={"form-panel"}
      layout={"vertical"}
      form={form}
      onFinish={onFinish}
      initialValues={{
        serviceName: "demo",
        routeGroups: [{}],
      }}
    >
      {contextHolder}
      <Flex
        justify={"space-between"}
        align={"center"}
        className={"form-container-header"}
      >
        <Title level={4} ellipsis style={{ margin: 0 }}>
          {t("builderPanelTitle")}
        </Title>

        <Form.Item>
          <Button size={"middle"} type={"primary"} htmlType={"submit"}>
            <ConverterIcon
              type={"icon-terminal"}
              className="welcome-start-icon"
            />
            {t("btnBuild")}
          </Button>
        </Form.Item>
      </Flex>
      <div className={"form-container-divider"} />
      <Flex vertical className={"form-panel-form-child"}>
        <Form.Item
          label={t("formServiceTitle")}
          name="serviceName"
          tooltip={t("")}
          rules={[
            {
              required: true,
              message: `${t("formInputPrefix")}${t("formServiceTitle")}`,
            },
            {
              pattern: RoutePanelData.IDPattern,
              message: `${t("formServiceTitle")}${t("formRegexTooltip")}: ${RoutePanelData.PathPattern}`,
            },
          ]}
          className={"form-panel-form-item"}
        >
          <Input
            placeholder={`${t("formInputPrefix")}${t("formServiceTitle")}`}
            allowClear
          />
        </Form.Item>

        <Form.List name="routeGroups">
          {(routeGroupFields, routeGroupOperation) => (
            <div
              style={{ display: "flex", rowGap: 16, flexDirection: "column" }}
            >
              {routeGroupFields.map((routeGroupField) => (
                <Collapse
                  key={routeGroupField.key}
                  defaultActiveKey={[routeGroupField.key]}
                  items={[
                    {
                      key: routeGroupField.key,
                      label:
                        t("formRouteGroupTitle") +
                        `${routeGroupField.name + 1}`,
                      children: (
                        <RouteGroupPanel
                          routeGroupField={routeGroupField}
                          form={form}
                        />
                      ),
                      extra: (
                        <CloseOutlined
                          onClick={() => {
                            routeGroupOperation.remove(routeGroupField.name);
                          }}
                        />
                      ),
                    },
                  ]}
                />
              ))}

              <Button
                type="dashed"
                onClick={() => routeGroupOperation.add()}
                block
              >
                + {t("formButtonRouteGroupAdd")}
              </Button>
            </div>
          )}
        </Form.List>
      </Flex>
    </Form>
  );
};

export default FormPanel;

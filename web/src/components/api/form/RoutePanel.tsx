import React, { useState } from "react";
import { Button, Collapse, Form, Modal, notification } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { FormListFieldData } from "antd/es/form/FormList";
import { useTranslation } from "react-i18next";
import type { FormInstance } from "antd/es/form/hooks/useForm";
import RequestLinePanel from "./RequestLinePanel";
import RequestBodyPanel from "./RequestBodyPanel";
import CodeMirrorPanel from "./CodeMirrorPanel";
import { RoutePanelData, Method } from "./_defaultProps";

interface RoutePanelProps {
  routeGroupField: FormListFieldData;
  form: FormInstance;
}

const RoutePanel: React.FC<
  RoutePanelProps & React.RefAttributes<HTMLDivElement>
> = (props) => {
  const { t } = useTranslation();
  const routeGroupField = props.routeGroupField;
  const form = props.form;
  const [initRequestValues, setInitRequestValues] = useState([
    {
      path: "",
      method: Method.POST.toLowerCase(),
      requestBodyFields: [],
      responseBody: "",
    },
  ]);
  const [responseCode, setResponseCode] = useState("");
  const [api, contextHolder] = notification.useNotification();
  return (
    <div>
      {contextHolder}
      <Form.Item label={t("formRouteListTitle")}>
        <Form.List
          initialValue={initRequestValues}
          name={[routeGroupField.name, "routes"]}
        >
          {(routeFields, routeOpt) => (
            <div
              style={{
                display: "flex",
                rowGap: 16,
                flexDirection: "column",
              }}
            >
              {routeFields.map((routeField) => (
                <Collapse
                  key={routeField.key}
                  defaultActiveKey={[routeField.key]}
                  items={[
                    {
                      key: routeField.key,
                      label: t("formRouteTitle") + `${routeField.name + 1}`,
                      children: (
                        <div>
                          {/*request line component*/}
                          <RequestLinePanel routeField={routeField} />
                          {/*request body*/}
                          <Form.Item
                            key={routeGroupField.key}
                            tooltip={t("formRequestBodyTooltip")}
                            label={t("formRequestBodyTitle")}
                          >
                            <Form.List
                              name={[routeField.name, "requestBodyFields"]}
                            >
                              {(requestBodyFields, requestBodyOpt) => (
                                <RequestBodyPanel
                                  routeGroupField={routeGroupField}
                                  requestBodyFields={requestBodyFields}
                                  requestBodyOpt={requestBodyOpt}
                                  routeField={routeField}
                                  form={form}
                                />
                              )}
                            </Form.List>
                          </Form.Item>
                          {/*  response body  */}
                          <Form.Item
                            label={t("formResponseBodyTitle")}
                            name={[routeField.name, "responseBody"]}
                          >
                            <CodeMirrorPanel
                              value={responseCode}
                              placeholder={t("formResponseBodyPlaceholder")}
                              onChange={(code) => {
                                setResponseCode(code);
                              }}
                            />
                          </Form.Item>
                        </div>
                      ),
                      extra: (
                        <CloseOutlined
                          onClick={() => {
                            routeOpt.remove(routeField.name);
                          }}
                        />
                      ),
                    },
                  ]}
                />
              ))}
              <Button
                type="dashed"
                onClick={() =>
                  routeOpt.add({
                    method: Method.POST.toLowerCase(),
                  })
                }
                block
              >
                + {t("formButtonRouteAdd")}
              </Button>
            </div>
          )}
        </Form.List>
      </Form.Item>
    </div>
  );
};

export default RoutePanel;

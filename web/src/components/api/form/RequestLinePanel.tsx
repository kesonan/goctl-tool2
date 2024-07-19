import React, { useState } from "react";
import {
  Button,
  Flex,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Select,
  Switch,
  Table,
  Tooltip,
  Typography,
} from "antd";
import { FormListFieldData } from "antd/es/form/FormList";
import { useTranslation } from "react-i18next";
import { RoutePanelData } from "./_defaultProps";
import TagModal from "./TagModal";

interface RequestLinePanelProps {
  routeField: FormListFieldData;
}

const { TextArea } = Input;
const { Text, Title } = Typography;

const RequestLinePanel: React.FC<
  RequestLinePanelProps & React.RefAttributes<HTMLDivElement>
> = (props) => {
  const { t, i18n } = useTranslation();
  const [api, contextHolder] = message.useMessage();
  const routeField = props.routeField;
  const [openModal, setOpenModal] = useState(false);
  return (
    <div>
      {contextHolder}
      <TagModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
        }}
      />
      <Flex vertical wrap>
        <Flex gap={8} wrap>
          <Form.Item
            style={{ flex: "0.75" }}
            label={t("formPathTitle")}
            name={[routeField.name, "path"]}
            rules={[
              {
                required: true,
                message: `${t("formInputPrefix")}${t("formPathTitle")}`,
              },
              {
                pattern: RoutePanelData.PathPattern,
                message: `${t("formPathTitle")}${t("formRegexTooltip")}: ${RoutePanelData.PathPattern}`,
              },
            ]}
          >
            <Input
              placeholder={`${t("formInputPrefix")}${t("formPathTitle")}`}
              allowClear
              addonBefore={
                <div>
                  <Form.Item noStyle name={[routeField.name, "method"]}>
                    <Select
                      style={{ width: 100 }}
                      options={RoutePanelData.MethodOptions}
                    />
                  </Form.Item>
                </div>
              }
            />
          </Form.Item>
          <Form.Item
            style={{ flex: "0.25" }}
            label={t("formHandlerTitle")}
            name={[routeField.name, "handler"]}
            tooltip={t("formHandlerTooltip")}
            rules={[
              {
                pattern: RoutePanelData.IDPattern,
                message: `${t("formHandlerTitle")}${t("formRegexTooltip")}: ${RoutePanelData.IDPattern}`,
              },
            ]}
          >
            <Input
              placeholder={`${t("formInputPrefix")}${t("formHandlerTitle")}`}
              allowClear
            />
          </Form.Item>
        </Flex>

        <span
          style={{
            position: "absolute",
            right: 0,
            top: 150,
            left: i18n.language === "en" ? 130 : 100,
            zIndex: 1000,
          }}
        >
          <Text
            style={{ cursor: "pointer", fontSize: 14, color: "#1890ff" }}
            onClick={() => setOpenModal(true)}
          >
            {t("formLabelDetail")}
          </Text>
        </span>
        <Form.Item
          style={{ flex: 1 }}
          label={t("formRequestBodyTagTemplateTitle")}
          name={[routeField.name, "tagTemplate"]}
          tooltip={t("formRequestBodyTagTemplateTooltip")}
        >
          <TextArea
            autoSize={{ minRows: 2, maxRows: 4 }}
            allowClear
            placeholder={t("formRequestBodyTagTemplatePlaceholder")}
          />
        </Form.Item>
      </Flex>
    </div>
  );
};

export default RequestLinePanel;

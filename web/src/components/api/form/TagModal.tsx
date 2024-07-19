import React, { useEffect, useState } from "react";
import {
  Button,
  Flex,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Switch,
  Table,
  Tooltip,
  Typography,
} from "antd";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { CopyOutlined } from "@ant-design/icons";
import { RoutePanelData } from "./_defaultProps";
import { useTranslation } from "react-i18next";
import { Http } from "../../../util/http";

interface TagModalProps {
  open: boolean;
  onClose: () => void;
}

const { Text } = Typography;
const { TextArea } = Input;

const TagModal: React.FC<
  TagModalProps & React.RefAttributes<HTMLDivElement>
> = (props) => {
  const [form] = Form.useForm();
  const { t, i18n } = useTranslation();
  const initTagText = `{{.type}}:"{{.name}}{{if .optional}},optional{{end}}{{if .defaultValue}},default={{.defaultValue}}{{end}}{{if .checkEnum}}{{if .enumValue}},options={{.enumValue}}{{end}}{{else}}{{if .rangeValue}},{{.rangeValue}}{{end}}{{end}}"`;
  const [tagText, setTagText] = useState(initTagText);
  const [tagValue, setTagValue] = useState("");
  const [checkEnum, setCheckEnum] = useState(true);
  const [api, contextHolder] = message.useMessage();
  const [tagModalOpen, setTagModalOpen] = useState(false);
  useEffect(() => {
    setTagModalOpen(props.open);
  });
  const initForm = {
    template: initTagText,
    name: "name",
    defaultValue: "foo",
    optional: false,
    checkEnum: true,
    enumValue: "foo|bar|baz",
  };
  const onCopy = () => {
    api.open({
      type: "success",
      content: "Copied to clipboard",
    });
  };
  const onFinish = (obj: any) => {
    Http.RenderTag(
      obj,
      (data) => {
        setTagValue(data);
        const container = document.getElementById("tagModal");
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      },
      (err) => {
        api.open({
          type: "error",
          content: err,
        });
      },
    );
  };

  const dataSource = [
    {
      key: "name",
      name: "{{.name}}",
      type: "string",
      description: t("tagTableTagDescName"),
      example: "name",
    },
    {
      key: "type",
      name: "{{.type}}",
      type: "string",
      description: t("tagTableTagTypeName"),
      example: "type",
    },
    {
      key: "optional",
      name: "{{.optional}}",
      type: "bool",
      description: t("tagTableDescTagOptional"),
    },
    {
      key: "defaultValue",
      name: "{{.defaultValue}}",
      type: "string",
      description: t("tagTableDescTagDefaultValue"),
    },
    {
      key: "checkEnum",
      name: "{{.checkEnum}}",
      type: "bool",
      description: t("tagTableDescTagCheckEnum"),
    },
    {
      key: "enumValue",
      name: "{{.enumValue}}",
      type: "string",
      description: t("tagTableDescTagEnumValue"),
    },
    {
      key: "rangeValue",
      name: "{{.rangeValue}}",
      type: "string",
      description: t("tagTableDescTagRangeValue"),
    },
  ];

  const columns = [
    {
      title: t("tagTableHeaderFieldName"),
      dataIndex: "name",
      key: "name",
    },
    {
      title: t("tagTableHeaderFieldType"),
      dataIndex: "type",
      key: "type",
    },
    {
      title: t("tagTableHeaderFieldDesc"),
      dataIndex: "description",
      key: "description",
    },
  ];
  return (
    <div>
      {contextHolder}
      <Modal
        title={t("formRequestBodyTagTemplateModalTitle")}
        open={tagModalOpen}
        closable={false}
        centered
        destroyOnClose={true}
        onOk={() => {
          props.onClose();
        }}
        cancelButtonProps={{
          style: {
            visibility: "hidden",
          },
        }}
        width={"40%"}
        okText={t("btnClose")}
      >
        <Flex
          id={"tagModal"}
          vertical
          gap={10}
          style={{ height: "80vh", overflowY: "scroll" }}
        >
          <Text style={{ margin: "10px 0" }}>{t("tagModalContent")}</Text>

          <Table
            dataSource={dataSource}
            columns={columns}
            pagination={false}
            size="small"
          />
          <Form
            initialValues={initForm}
            layout={"vertical"}
            onFinish={onFinish}
            style={{ flex: 1 }}
          >
            <Flex
              justify={"flex-end"}
              style={{
                position: "relative",
                top: 20,
                right: 0,
                zIndex: 1000,
              }}
            >
              <Tooltip title={t("tagModalCopy")}>
                <CopyToClipboard text={tagText} onCopy={onCopy}>
                  <Button size={"small"}>
                    <CopyOutlined /> {t("btnCopy")}
                  </Button>
                </CopyToClipboard>
              </Tooltip>
            </Flex>
            <Form.Item
              style={{ flex: 1 }}
              label={t("formRequestBodyTagTemplateTitle")}
              name={"template"}
            >
              <TextArea
                allowClear
                autoSize={{
                  minRows: 2,
                  maxRows: 4,
                }}
                placeholder={t("formRequestBodyTagTemplatePlaceholder")}
                onChange={(e) => {
                  setTagText(e.target.value);
                }}
              />
            </Form.Item>

            <Flex gap={8} style={{ flex: 1 }}>
              <Form.Item
                style={{ flex: 1 }}
                label={t("tagTableHeaderFieldName")}
                name={"name"}
                rules={[
                  {
                    required: true,
                    message: `${t("formInputPrefix")}${t("tagTableHeaderFieldName")}`,
                  },
                ]}
              >
                <Input
                  allowClear
                  maxLength={20}
                  placeholder={`${t("formInputPrefix")}${t("tagTableHeaderFieldName")}`}
                />
              </Form.Item>
              <Form.Item
                style={{ flex: 1 }}
                label={t("tagTableTagTypeLabel")}
                name={"type"}
                rules={[
                  {
                    required: true,
                    message: `${t("formInputPrefix")}${t("tagTableTagTypeLabel")}`,
                  },
                ]}
              >
                <Input
                  allowClear
                  maxLength={20}
                  placeholder={`${t("formInputPrefix")}${t("tagTableTagTypeLabel")}`}
                />
              </Form.Item>
              <Form.Item
                style={{ flex: 1 }}
                label={t("tagTableDescTagDefaultValue")}
                name={"defaultValue"}
              >
                <Input
                  allowClear
                  placeholder={`${t("formInputPrefix")}${t("tagTableDescTagDefaultValue")}`}
                />
              </Form.Item>
            </Flex>

            <Flex wrap gap={8}>
              <Form.Item
                style={{ flex: 0.25 }}
                label={t("tagTableDescTagOptional")}
                name={"optional"}
              >
                <Switch />
              </Form.Item>

              <Form.Item
                label={t("tagTableDescTagCheckEnum")}
                name={"checkEnum"}
              >
                <Switch
                  onChange={(checked) => {
                    setCheckEnum(checked);
                  }}
                />
              </Form.Item>

              <Flex wrap style={{ flex: 0.75 }} gap={8}>
                {checkEnum ? (
                  <Form.Item
                    style={{ flex: 1 }}
                    label={t("tagTableDescTagEnumValue")}
                    name={"enumValue"}
                    tooltip={t("formRequestBodyFieldEnumTooltip")}
                    rules={[
                      {
                        pattern: RoutePanelData.EnumCommaPattern,
                        message: `${t("formRequestBodyFieldEnumTitle")}${t("formRegexTooltip")}: ${RoutePanelData.EnumCommaPattern}`,
                      },
                    ]}
                  >
                    <Input
                      allowClear
                      maxLength={20}
                      placeholder={`${t("formInputPrefix")}${t("tagTableDescTagEnumValue")}`}
                    />
                  </Form.Item>
                ) : (
                  <Form.Item
                    style={{ flex: 1 }}
                    label={t("formRequestBodyFieldRangeTitle")}
                    tooltip={t("formRequestBodyFieldRangeTooltip")}
                  >
                    <Flex justify={"space-between"} align={"center"}>
                      <Form.Item noStyle name={"lowerBound"}>
                        <InputNumber style={{ width: "50%" }} />
                      </Form.Item>
                      <div
                        style={{
                          width: 10,
                          height: 1,
                          background: "#c1c1c1",
                          marginLeft: 8,
                          marginRight: 8,
                        }}
                      />
                      <Form.Item noStyle name={"upperBound"}>
                        <InputNumber style={{ width: "50%" }} />
                      </Form.Item>
                    </Flex>
                  </Form.Item>
                )}
              </Flex>
            </Flex>

            <Flex wrap gap={8} vertical>
              <Form.Item>
                <Button style={{ width: 100 }} htmlType={"submit"}>
                  {t("tagModalTry")}
                </Button>
              </Form.Item>

              <Text
                style={{
                  background: "#f1f1f1",
                  padding: "10px",
                  marginRight: 10,
                  borderRadius: 4,
                  height: 80,
                }}
              >
                {tagValue}
              </Text>
            </Flex>
          </Form>
        </Flex>
      </Modal>
    </div>
  );
};

export default TagModal;

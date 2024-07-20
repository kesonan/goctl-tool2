import React, { useEffect, useState } from "react";
import { Flex, Form, Input, Select, Modal, Switch } from "antd";
import { useTranslation } from "react-i18next";
import { RoutePanelData } from "./_defaultProps";
import { InputNumber } from "antd";

interface RequestFieldModalProps {
  open: boolean;
  data: any;
  onDataUpdate: (data: any) => void;
  onCancel: () => void;
}

const RequestFieldModal: React.FC<
  RequestFieldModalProps & React.RefAttributes<HTMLDivElement>
> = (props) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const data = props.data;
  const isNumberType = RoutePanelData.IsNumberType(data.type);
  const [typeIsNumber, setTypeIsNumber] = useState(isNumberType);
  useEffect(() => {
    form.setFieldsValue(data);
    setTypeIsNumber(isNumberType);
  }, [data]);
  return (
    <>
      <Modal
        title={t("formRequestBodyFieldModelTitle")}
        centered
        forceRender
        open={props.open}
        maskClosable={false}
        keyboard={false}
        closable={false}
        destroyOnClose
        okButtonProps={{ autoFocus: true, htmlType: "submit" }}
        width={500}
        okText={"OK"}
        onCancel={props.onCancel}
        modalRender={(dom) => (
          <Form
            layout="vertical"
            form={form}
            clearOnDestroy
            onFinish={(values) => {
              props.onDataUpdate(values);
            }}
          >
            {dom}
          </Form>
        )}
      >
        <Form.Item
          label={t("formRequestBodyFieldNameTitle")}
          name={"name"}
          style={{ flex: 1, marginTop: 20 }}
          tooltip={t("formRequestBodyFieldNameTooltip")}
          rules={[
            {
              required: true,
              message: `${t("formInputPrefix")}${t("formRequestBodyFieldNameTitle")}`,
            },
            {
              pattern: RoutePanelData.IDPattern,
              message: `${t("formRequestBodyFieldNameTitle")}${t("formRegexTooltip")}: ${RoutePanelData.IDPattern}`,
            },
          ]}
        >
          <Input
            allowClear
            placeholder={`${t("formInputPrefix")}${t("formRequestBodyFieldNameTitle")}`}
          />
        </Form.Item>
        <Flex gap={8} justify={"space-between"}>
          <Form.Item
            shouldUpdate
            label={t("formRequestBodyFieldTypeTitle")}
            name={"type"}
            style={{ flex: 1 }}
            rules={[
              {
                required: true,
                message: `${t("formInputPrefix")}${t("formRequestBodyFieldTypeTitle")}`,
              },
            ]}
          >
            <Select
              allowClear
              placeholder={`${t("formInputPrefix")}${t("formRequestBodyFieldTypeTitle")}`}
              options={RoutePanelData.GolangTypeOptions}
              showSearch
              onSelect={(value) => {
                const isNumberType = RoutePanelData.IsNumberType(value);
                setTypeIsNumber(isNumberType);
              }}
            />
          </Form.Item>
          <Form.Item
            label={t("formRequestBodyFieldOptionalTitle")}
            name={"optional"}
          >
            <Switch />
          </Form.Item>
        </Flex>
        <Form.Item
          label={t("formRequestBodyFieldDefaultTitle")}
          name={"defaultValue"}
        >
          <Input
            allowClear
            placeholder={`${t("formInputPrefix")}${t("formRequestBodyFieldDefaultTitle")}`}
          />
        </Form.Item>
        <Form.Item
          label={t("formRequestBodyFieldEnumTitle")}
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
            placeholder={`${t("formInputPrefix")}${t("formRequestBodyFieldEnumTitle")}`}
          />
        </Form.Item>

        <Form.Item
          label={t("formRequestBodyFieldRangeTitle")}
          tooltip={t("formRequestBodyFieldRangeTooltip")}
        >
          <Flex justify={"space-between"} align={"center"}>
            <Form.Item noStyle name={"lowerBound"}>
              <InputNumber style={{ width: "50%" }} disabled={!typeIsNumber} />
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
              <InputNumber style={{ width: "50%" }} disabled={!typeIsNumber} />
            </Form.Item>
          </Flex>
        </Form.Item>
      </Modal>
    </>
  );
};

export default RequestFieldModal;

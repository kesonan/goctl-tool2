import React, { useState } from "react";
import { CheckboxProps, Modal } from "antd";
import {
  Button,
  Checkbox,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  Select,
  Typography,
} from "antd";
import "./Mysql.css";
import { useTranslation } from "react-i18next";
import CodeMirror from "@uiw/react-codemirror";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";

const { Title } = Typography;

const Mysql: React.FC = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [code, setCode] = useState("");
  const [passwordVisible, setPasswordVisible] = React.useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const onChange: CheckboxProps["onChange"] = (e) => {
    console.log(`checked = ${e.target.checked}`);
  };
  const onFinish = (obj: any) => {
    setModalOpen(true);
  };

  return (
    <>
      <Modal
        title={t("mysqlModalTitle")}
        style={{ top: 20 }}
        open={modalOpen}
        maskClosable={false}
        closable={false}
        onOk={() => setModalOpen(false)}
        onCancel={() => setModalOpen(false)}
        okText={t("mysqlModalOkTitle")}
        footer={[
          <Checkbox>{t("mysqlModalCheckTitle")}</Checkbox>,
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              setModalOpen(false);
            }}
          >
            {t("mysqlModalOkTitle")}
          </Button>,
        ]}
      >
        <p>{t("mysqlModalContent")}</p>
        <p>{t("mysqlModalContent1")}</p>
        <p>{t("mysqlModalContent2")}</p>
      </Modal>

      <Flex className="mysql" gap={1} wrap>
        <Form
          onFinish={onFinish}
          form={form}
          layout="vertical"
          className={"mysql-form-container"}
        >
          <Flex vertical wrap justify={"space-around"}>
            <Divider orientation="left">{t("mysqlConnectionTitle")}</Divider>
            <div className={"mysql-connection-panel"}>
              <Flex flex={1} gap={8} wrap>
                <Form.Item
                  label={t("mysqlHost")}
                  style={{ flex: 0.7 }}
                  name={"host"}
                  tooltip={t("mysqlHostTooltip")}
                >
                  <Input
                    placeholder={`${t("formInputPrefix")}${t("mysqlHost")}`}
                  />
                </Form.Item>
                <Form.Item
                  label={t("mysqlPort")}
                  style={{ flex: 0.3 }}
                  name={"port"}
                >
                  <InputNumber
                    style={{ width: "100%" }}
                    placeholder={`${t("formInputPrefix")}${t("mysqlPort")}`}
                    min={0}
                    max={65535}
                    precision={0}
                  />
                </Form.Item>
              </Flex>

              <Flex flex={1} wrap gap={8}>
                <Form.Item
                  label={t("mysqlUsername")}
                  name={"username"}
                  style={{ flex: 1 }}
                >
                  <Input
                    placeholder={`${t("formInputPrefix")}${t("mysqlUsername")}`}
                  />
                </Form.Item>
                <Form.Item
                  label={t("mysqlPassword")}
                  name={"password"}
                  style={{ flex: 1 }}
                >
                  <Input.Password
                    placeholder={`${t("formInputPrefix")}${t("mysqlPassword")}`}
                    iconRender={(visible) =>
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    }
                  />
                </Form.Item>
              </Flex>
              <Flex justify={"space-between"} align={"center"} flex={1}>
                <Form.Item noStyle style={{ flex: 1 }}>
                  <Button type={"primary"} htmlType={"submit"}>
                    {t("mysqlConnection")}
                  </Button>
                </Form.Item>
                <Form.Item noStyle style={{ flex: 1 }}>
                  <Checkbox onChange={onChange}>{t("mysqlRemember")}</Checkbox>
                </Form.Item>
              </Flex>
            </div>
            <Divider orientation="left">{t("mysqlGenerateTitle")}</Divider>
            <div className={"mysql-connection-panel"}>
              <Flex justify={"space-around"} flex={1} gap={10}>
                <Form.Item
                  label={t("mysqlSchema")}
                  style={{ flex: 1 }}
                  name={"schema"}
                >
                  <Select />
                </Form.Item>
                <Form.Item
                  label={t("mysqlTable")}
                  style={{ flex: 1 }}
                  name={"table"}
                >
                  <Select />
                </Form.Item>
              </Flex>
              <Flex wrap gap={8}>
                <Form.Item
                  label={t("mysqlStyle")}
                  style={{ flex: 1 }}
                  name={"style"}
                  tooltip={t("mysqlStyleTooltip")}
                >
                  <Input
                    placeholder={`${t("formInputPrefix")}${t("mysqlStyle")}`}
                  />
                </Form.Item>
                <Form.Item
                  label={t("mysqlIgnoreColumns")}
                  style={{ flex: 1 }}
                  name={"ignoreColumns"}
                >
                  <Input
                    placeholder={`${t("formInputPrefix")}${t("mysqlIgnoreColumns")}`}
                  />
                </Form.Item>
              </Flex>
              <Flex justify={"space-around"} flex={1} gap={10}>
                <Form.Item label={""} style={{ flex: 1 }} name={"cache"}>
                  <Checkbox>{t("mysqlCache")}</Checkbox>
                </Form.Item>
                <Form.Item
                  label={""}
                  style={{ flex: 1 }}
                  name={"strict"}
                  tooltip={t("mysqlStrictTooltip")}
                >
                  <Checkbox>{t("mysqlStrict")}</Checkbox>
                </Form.Item>
              </Flex>

              <Flex justify={"flex-end"}>
                <Form.Item noStyle style={{ flex: 1 }}>
                  <Button type={"primary"} htmlType={"submit"}>
                    {t("mysqlGenerate")}
                  </Button>
                </Form.Item>
              </Flex>
            </div>
          </Flex>
        </Form>
        <CodeMirror
          style={{
            flex: 1,
            height: "100%",
            background: "white",
            minWidth: 500,
          }}
          // className={"mysql-editor-container"}
        />
      </Flex>
    </>
  );
};

export default Mysql;

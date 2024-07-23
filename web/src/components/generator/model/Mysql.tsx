import React, { useState } from "react";
import type { CheckboxProps } from "antd";
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

const { Title } = Typography;

const Mysql: React.FC = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [code, setCode] = useState("");
  const onChange: CheckboxProps["onChange"] = (e) => {
    console.log(`checked = ${e.target.checked}`);
  };

  return (
    <Flex className="mysql" gap={1} wrap>
      <Form form={form} layout="vertical" className={"mysql-form-container"}>
        <Flex vertical wrap justify={"space-around"}>
          <Divider orientation="left">{t("mysqlConnectionTitle")}</Divider>
          <div className={"mysql-connection-panel"}>
            <Flex flex={1} gap={10} wrap>
              <Form.Item
                label={t("mysqlHost")}
                style={{ flex: 0.7 }}
                name={"host"}
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

            <Flex vertical flex={1} wrap>
              <Form.Item label={t("mysqlUsername")} name={"username"}>
                <Input
                  placeholder={`${t("formInputPrefix")}${t("mysqlUsername")}`}
                />
              </Form.Item>
              <Form.Item label={t("mysqlPassword")} name={"password"}>
                <Input
                  placeholder={`${t("formInputPrefix")}${t("mysqlPassword")}`}
                />
              </Form.Item>

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
            <Flex vertical wrap>
              <Form.Item
                label={t("mysqlStyle")}
                style={{ flex: 1 }}
                name={"style"}
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
              <Form.Item label={""} style={{ flex: 1 }} name={"strict"}>
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
        style={{ flex: 0.7, height: "100%", background: "white" }}
        className={"mysql-editor-container"}
      />
    </Flex>
  );
};

export default Mysql;

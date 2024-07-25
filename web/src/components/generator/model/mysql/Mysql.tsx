import React, { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  CheckboxProps,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  notification,
  Typography,
} from "antd";
import "./Mysql.css";
import { useTranslation } from "react-i18next";
import CodeMirror from "@uiw/react-codemirror";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  PoweroffOutlined,
} from "@ant-design/icons";
import { MysqlData } from "./_defaultProps";
import { RoutePanelData } from "../../../api/form/_defaultProps";
import { FormFinishInfo } from "rc-field-form/lib/FormContext";
import { Http } from "../../../../util/http";

const { Title } = Typography;

const Mysql: React.FC = () => {
  const { t } = useTranslation();
  const [api, contextHolder] = notification.useNotification();
  const [code, setCode] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCheck, setModalCheck] = useState(false);
  const [hideModal, setHideModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validDSN, setValidDSN] = useState(false);
  const [remember, setRemember] = useState(true);
  const [mysqlConnectInfo, setMysqlConnectInfo] = useState({});
  const [schemas, setSchemas] = useState([{}]);
  const [tables, setTables] = useState([{}]);
  const [initialValues, setInitialValues] = useState([
    {
      host: "localhost",
      port: 3306,
    },
  ]);
  const [connectionForm] = Form.useForm();
  const [generateForm] = Form.useForm();
  const onChange: CheckboxProps["onChange"] = (e) => {
    setRemember(e.target.checked);
  };

  useEffect(() => {
    const value = localStorage.getItem(MysqlData.hideConnectModal);
    if (value && value === "true") {
      setHideModal(true);
    }
    const val = localStorage.getItem(MysqlData.rememberConnect);
    if (val) {
      const mysqlConnectData = JSON.parse(val);
      if (mysqlConnectData) {
        setInitialValues(mysqlConnectData);
        Http.ConnectDB(
          mysqlConnectData,
          (schemas: string[]) => {
            setMysqlConnectInfo(mysqlConnectData);
            setValidDSN(true);
            let schemaOptions = [];
            for (let i = 0; schemas.length; i++) {
              schemaOptions.push({
                label: schemas[i],
                value: schemas[i],
              });
            }
            setSchemas(schemaOptions);
          },
          (err) => {
            api.error({
              message: t("mysqlConnectError"),
              description: err,
              placement: "topRight",
            });
          },
        );
      }
    }
  }, []);

  const catchErr = (err: any) => {};

  const onSubmit = (name: string) => {
    const connectionFormPromise = connectionForm.validateFields();
    const generateFormPromise = generateForm.validateFields();
    connectionFormPromise
      .then((values: any) => {
        generateFormPromise
          .then((values: any) => {
            console.log("connectionForm:", connectionForm.getFieldsValue());
            console.log("generateForm:", generateForm.getFieldsValue());
            switch (name) {
              case "refresh":
                Http.ConnectDB(
                  mysqlConnectInfo,
                  (schemas: string[]) => {
                    setValidDSN(true);
                    let schemaOptions = [];
                    for (let i = 0; schemas.length; i++) {
                      schemaOptions.push({
                        label: schemas[i],
                        value: schemas[i],
                      });
                    }
                    setSchemas(schemaOptions);
                    setLoading(true);
                  },
                  (err) => {
                    api.error({
                      message: t("mysqlConnectError"),
                      description: err,
                      placement: "topRight",
                    });
                  },
                );
                break;
              default:
            }
          })
          .catch(catchErr);
      })
      .catch(catchErr);
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
        destroyOnClose
        footer={[
          <Checkbox
            key={"checkBox"}
            id={"modal-check"}
            value={modalCheck}
            onChange={(e) => {
              setModalCheck(e.target.checked);
            }}
          >
            {t("mysqlModalCheckTitle")}
          </Checkbox>,
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              if (modalCheck) {
                setHideModal(true);
                localStorage.setItem(MysqlData.hideConnectModal, "true");
              }
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
      {contextHolder}
      <Flex className="mysql" gap={1} wrap>
        <div className={"mysql-form-container"}>
          <Form.Provider>
            <Flex vertical wrap justify={"space-around"}>
              <Divider orientation="left">{t("mysqlConnectionTitle")}</Divider>
              <Form
                layout="vertical"
                form={connectionForm}
                initialValues={initialValues}
                onFinish={(values) => {
                  Http.ConnectDB(
                    values,
                    (schemas: string[]) => {
                      setValidDSN(true);
                      if (remember) {
                        localStorage.setItem(
                          MysqlData.rememberConnect,
                          JSON.stringify(values),
                        );
                      }
                      let schemaOptions = [];
                      for (let i = 0; schemas.length; i++) {
                        schemaOptions.push({
                          label: schemas[i],
                          value: schemas[i],
                        });
                      }
                      setSchemas(schemaOptions);
                    },
                    (err) => {
                      api.error({
                        message: t("mysqlConnectError"),
                        description: err,
                        placement: "topRight",
                      });
                    },
                  );
                }}
              >
                <div className={"mysql-connection-panel"}>
                  <Flex flex={1} gap={8} wrap>
                    <Form.Item
                      label={t("mysqlHost")}
                      style={{ flex: 0.7 }}
                      name={"host"}
                      tooltip={t("mysqlHostTooltip")}
                      rules={[
                        {
                          required: true,
                          message: `${t("formInputPrefix")}${t("mysqlHost")}`,
                        },
                      ]}
                    >
                      <Input
                        disabled={validDSN}
                        allowClear
                        placeholder={`${t("formInputPrefix")}${t("mysqlHost")}`}
                      />
                    </Form.Item>
                    <Form.Item
                      label={t("mysqlPort")}
                      style={{ flex: 0.3 }}
                      name={"port"}
                      rules={[
                        {
                          required: true,
                          message: `${t("formInputPrefix")}${t("mysqlHost")}`,
                        },
                      ]}
                    >
                      <InputNumber
                        disabled={validDSN}
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
                        disabled={validDSN}
                        allowClear
                        placeholder={`${t("formInputPrefix")}${t("mysqlUsername")}`}
                      />
                    </Form.Item>
                    <Form.Item
                      label={t("mysqlPassword")}
                      name={"password"}
                      style={{ flex: 1 }}
                    >
                      <Input.Password
                        disabled={validDSN}
                        allowClear
                        placeholder={`${t("formInputPrefix")}${t("mysqlPassword")}`}
                        iconRender={(visible) =>
                          visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                        }
                      />
                    </Form.Item>
                  </Flex>
                  {validDSN ? (
                    <>
                      <Flex justify={"flex-end"} align={"center"} flex={1}>
                        <Form.Item noStyle style={{ flex: 1 }}>
                          <Button
                            type={"primary"}
                            danger
                            onClick={() => {
                              setValidDSN(false);
                              localStorage.removeItem(
                                MysqlData.rememberConnect,
                              );
                              setMysqlConnectInfo({});
                              connectionForm.resetFields();
                            }}
                          >
                            {t("mysqlBtnReset")}
                          </Button>
                        </Form.Item>
                      </Flex>
                    </>
                  ) : (
                    <Flex justify={"space-between"} align={"center"} flex={1}>
                      <Form.Item noStyle style={{ flex: 1 }}>
                        <Button type={"primary"} htmlType={"submit"}>
                          {t("mysqlConnection")}
                        </Button>
                      </Form.Item>
                      <Form.Item noStyle style={{ flex: 1 }}>
                        <Checkbox onChange={onChange}>
                          {t("mysqlRemember")}
                        </Checkbox>
                      </Form.Item>
                    </Flex>
                  )}
                </div>
              </Form>
              <Divider orientation="left">{t("mysqlGenerateTitle")}</Divider>

              <div className={"mysql-connection-panel"}>
                <Form
                  initialValues={{
                    schema: "",
                    table: [],
                    cache: false,
                    strict: false,
                    mysqlStyle: "",
                    mysqlIgnoreColumns: "",
                  }}
                  layout="vertical"
                  form={generateForm}
                >
                  <Flex justify={"space-around"} flex={1} gap={10}>
                    <Form.Item
                      label={t("mysqlSchema")}
                      style={{ flex: 1 }}
                      name={"schema"}
                      rules={[
                        {
                          required: true,
                          message: `${t("formSelectPrefix")}${t("mysqlSchema")}`,
                        },
                      ]}
                    >
                      <Select
                        allowClear
                        options={schemas}
                        onChange={(value) => {
                          Http.GetTables(
                            {
                              schema: value,
                            },
                            (data) => {
                              setLoading(true);
                              let list = [{}];
                              for (let i = 0; i < data.length; i++) {
                                list.push({
                                  label: data[i],
                                  value: data[i],
                                });
                              }
                              setTables(list);
                            },
                            (err) => {
                              setLoading(true);
                              api.error({
                                message: t("mysqlGetTablesError"),
                                description: err,
                                placement: "topRight",
                              });
                            },
                          );
                        }}
                      />
                    </Form.Item>
                    <Form.Item
                      label={t("mysqlTable")}
                      style={{ flex: 1 }}
                      name={"table"}
                      rules={[
                        {
                          required: true,
                          message: `${t("formSelectPrefix")}${t("mysqlTable")}`,
                        },
                      ]}
                    >
                      <Select mode="multiple" allowClear options={tables} />
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
                        allowClear
                        placeholder={`${t("formInputPrefix")}${t("mysqlStyle")}`}
                      />
                    </Form.Item>
                    <Form.Item
                      label={t("mysqlIgnoreColumns")}
                      style={{ flex: 1 }}
                      name={"ignoreColumns"}
                    >
                      <Input
                        allowClear
                        placeholder={`${t("formInputPrefix")}${t("mysqlIgnoreColumns")}`}
                      />
                    </Form.Item>
                  </Flex>
                  <Flex justify={"space-around"} flex={1} gap={10}>
                    <Form.Item
                      label={""}
                      style={{ flex: 1 }}
                      name={"cache"}
                      valuePropName="checked"
                    >
                      <Checkbox>{t("mysqlCache")}</Checkbox>
                    </Form.Item>
                    <Form.Item
                      label={""}
                      style={{ flex: 1 }}
                      name={"strict"}
                      tooltip={t("mysqlStrictTooltip")}
                      valuePropName="checked"
                    >
                      <Checkbox>{t("mysqlStrict")}</Checkbox>
                    </Form.Item>
                  </Flex>

                  <Flex justify={"flex-end"} gap={8}>
                    <Button
                      loading={loading}
                      type={"dashed"}
                      onClick={() => {
                        onSubmit("refresh");
                      }}
                    >
                      {t("mysqlBtnRefresh")}
                    </Button>
                    <Form.Item noStyle style={{ flex: 1 }}>
                      <Button
                        type={"primary"}
                        onClick={() => {
                          onSubmit("submit");
                        }}
                      >
                        {t("mysqlGenerate")}
                      </Button>
                    </Form.Item>
                  </Flex>
                </Form>
              </div>
            </Flex>
          </Form.Provider>
        </div>
        <CodeMirror
          style={{
            flex: 1,
            height: "100%",
            background: "white",
            minWidth: 300,
          }}
          // className={"mysql-editor-container"}
        />
      </Flex>
    </>
  );
};

export default Mysql;

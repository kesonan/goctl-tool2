import React, { useEffect, useState } from "react";
import { GetProps, Tooltip, TreeDataNode } from "antd";
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
  notification,
  Select,
  Tree,
  Typography,
} from "antd";
import "./Mysql.css";
import { useTranslation } from "react-i18next";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { MysqlData } from "./_defaultProps";
import { File, Http } from "../../../../util/http";
import { githubLight } from "@uiw/codemirror-theme-github";
import { langs } from "@uiw/codemirror-extensions-langs";

const { DirectoryTree } = Tree;
type DirectoryTreeProps = GetProps<typeof Tree.DirectoryTree>;
const { Text } = Typography;

export type Option = {
  label: string;
  value: string;
};

const Mysql: React.FC = () => {
  const { t } = useTranslation();
  const [api, contextHolder] = notification.useNotification();
  const [code, setCode] = useState(``);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalCheck, setModalCheck] = useState(false);
  const [hideModal, setHideModal] = useState(false);
  const [validDSN, setValidDSN] = useState(false);
  const [remember, setRemember] = useState(true);
  const [mysqlFiles, setMysqlFiles] = useState<File[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [treeData, setTreeData] = useState<TreeDataNode[]>([
    {
      title: "model",
      key: "model",
    },
  ]);
  const [mysqlConnectInfo, setMysqlConnectInfo] = useState({
    host: "localhost",
    port: 3306,
    username: "",
    password: "",
  });
  const [schemas, setSchemas] = useState<Option[]>();
  const [tables, setTables] = useState<Option[]>();
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
        connectionForm.setFieldsValue(mysqlConnectData);
        Http.ConnectDB(
          mysqlConnectData,
          (schemas: string[]) => {
            setMysqlConnectInfo(mysqlConnectData);
            setValidDSN(true);
            if (!schemas) {
              return;
            }
            let schemaOptions: Option[] = [];
            for (let i = 0; i < schemas.length; i++) {
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
            const connectionFields = connectionForm.getFieldsValue();
            const generateFields = generateForm.getFieldsValue();
            if (name === "download") {
              Http.MysqlDownload(
                {
                  host: connectionFields.host,
                  port: mysqlConnectInfo.port,
                  username: mysqlConnectInfo.username,
                  password: mysqlConnectInfo.password,
                  schema: generateFields.schema,
                  tables: generateFields.tables,
                  style: generateFields.style,
                  cache: generateFields.cache,
                  strict: generateFields.strict,
                },
                () => {
                  api.success({
                    message: t("mysqlDownloadSuccess"),
                    placement: "topRight",
                  });
                },
                (err) => {
                  api.error({
                    message: t("mysqlDownloadError"),
                    description: err,
                    placement: "topRight",
                  });
                },
              );
            } else {
              Http.MysqlGen(
                {
                  host: connectionFields.host,
                  port: mysqlConnectInfo.port,
                  username: mysqlConnectInfo.username,
                  password: mysqlConnectInfo.password,
                  schema: generateFields.schema,
                  tables: generateFields.tables,
                  style: generateFields.style,
                  cache: generateFields.cache,
                  strict: generateFields.strict,
                },
                (data) => {
                  if (!data) {
                    return;
                  }
                  setMysqlFiles(data);
                  let trees: TreeDataNode[] = [];
                  for (let i = 0; i < data.length; i++) {
                    const item = data[i];
                    trees.push({
                      title: (
                        <Tooltip title={item.name}>
                          <Text ellipsis style={{ width: 150 }}>
                            {item.name}
                          </Text>
                        </Tooltip>
                      ),
                      key: item.name,
                      isLeaf: true,
                    });
                  }
                  setTreeData([
                    {
                      title: "model",
                      key: "model",
                      children: trees,
                    },
                  ]);
                  setSelectedKeys([data[0].name]);
                  setCode(data[0].content);
                },
                (err) => {
                  api.error({
                    message: t("mysqlGenError"),
                    description: err,
                    placement: "topRight",
                  });
                },
              );
            }
          })
          .catch(catchErr);
      })
      .catch(catchErr);
  };

  const onSelect: DirectoryTreeProps["onSelect"] = (keys, info) => {
    if (!keys) {
      return;
    }
    const key = keys[0];
    setSelectedKeys([key as string]);
    for (let i = 0; i < mysqlFiles.length; i++) {
      const file = mysqlFiles[i];
      const name = file.name;
      if (name === key) {
        setCode(file.content);
        break;
      }
    }
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
                initialValues={{
                  host: "localhost",
                  port: 3306,
                  remember: remember,
                }}
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
                      if (!schemas) {
                        return;
                      }
                      let schemaOptions = [];
                      for (let i = 0; i < schemas.length; i++) {
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
                              setMysqlConnectInfo({
                                host: "localhost",
                                port: 3306,
                                username: "",
                                password: "",
                              });
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
                      <Form.Item noStyle style={{ flex: 1 }} name={"remember"}>
                        <Checkbox onChange={onChange} checked={remember}>
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
                          if (!value) {
                            return;
                          }
                          Http.GetTables(
                            {
                              host: mysqlConnectInfo.host,
                              port: mysqlConnectInfo.port,
                              username: mysqlConnectInfo.username,
                              password: mysqlConnectInfo.password,
                              schema: value,
                            },
                            (data) => {
                              if (!data) {
                                return;
                              }
                              let list: Option[] = [];
                              for (let i = 0; i < data.length; i++) {
                                list.push({
                                  label: data[i],
                                  value: data[i],
                                });
                              }
                              setTables(list);
                            },
                            (err) => {
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
                      name={"tables"}
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
                    <Form.Item noStyle style={{ flex: 1 }}>
                      <Button
                        type={"dashed"}
                        onClick={() => {
                          onSubmit("download");
                        }}
                      >
                        {t("mysqlDownload")}
                      </Button>
                    </Form.Item>
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
        <Flex
          gap={1}
          style={{
            flex: 1,
            height: "100%",
            background: "#f1f1f1",
            minWidth: 300,
          }}
        >
          <DirectoryTree
            showLine
            showIcon={false}
            defaultExpandAll
            onSelect={onSelect}
            treeData={treeData}
            selectedKeys={selectedKeys}
            style={{
              width: 200,
            }}
          />
          <CodeMirror
            className={"mysql-editor-container"}
            value={code}
            extensions={[
              langs.go(),
              EditorView.theme({
                "&.cm-focused": {
                  outline: "none",
                },
              }),
            ]}
            readOnly
            theme={githubLight}
            style={{
              flex: 1,
              height: "100%",
              background: "white",
              overflow: "scroll",
            }}
          />
        </Flex>
      </Flex>
    </>
  );
};

export default Mysql;

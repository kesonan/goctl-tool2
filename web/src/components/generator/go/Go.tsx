import React, { useState } from "react";
import { Layout, Flex, Space, Button, Typography } from "antd";
import "../../../Base.css";
import "./Go.css";
import { langs } from "@uiw/codemirror-extensions-langs";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { githubLight } from "@uiw/codemirror-theme-github";
import { SettingOutlined, DeleteOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const { Title } = Typography;

const Go: React.FC = () => {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  return (
    <Layout className="go">
      <Flex
        justify={"space-between"}
        align={"center"}
        className={"go-code-container-header"}
      >
        <Title ellipsis level={4} style={{ margin: 0 }}>
          {t("goTitle")}
        </Title>
        <Space>
          <Button size={"middle"} danger onClick={() => {}}>
            <DeleteOutlined /> {t("btnClear")}
          </Button>

          <Button size={"middle"}>
            <SettingOutlined /> {t("btnSetting")}
          </Button>
        </Space>
      </Flex>
      <div className={"go-code-container-divider"} />
      <CodeMirror
        className={"go-code-mirror"}
        extensions={[
          langs.go(),
          EditorView.theme({
            "&.cm-focused": {
              outline: "none",
            },
          }),
        ]}
        value={code}
        theme={githubLight}
      />
    </Layout>
  );
};

export default Go;

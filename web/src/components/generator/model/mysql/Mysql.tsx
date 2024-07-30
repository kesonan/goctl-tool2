import React, { useState } from "react";
import { GetProps, Layout, notification, Tabs, Tree, Typography } from "antd";
import "./Datasource.css";
import { useTranslation } from "react-i18next";
import { File } from "../../../../util/http";
import { Outlet } from "react-router-dom";
import DDL from "./DDL";
import Datasource from "./Datasource";

const { DirectoryTree } = Tree;
type DirectoryTreeProps = GetProps<typeof Tree.DirectoryTree>;
const { Text } = Typography;

export type Option = {
  label: string;
  value: string;
};

const Mysql: React.FC = () => {
  const { t } = useTranslation();
  const onChange = (key: string) => {
    console.log(key);
  };

  return (
    <>
      <Tabs
        onChange={onChange}
        style={{
          overflowY: "hidden",
          padding: "24px",
        }}
        type="card"
        items={[
          {
            label: t("mysqlTabDatasource"),
            key: "datasource",
            children: (
              <Layout style={{ height: "74vh" }}>
                <Datasource />
              </Layout>
            ),
          },
          {
            label: t("mysqlTabDDL"),
            key: "ddl",
            children: <DDL />,
          },
        ]}
      />
    </>
  );
};

export default Mysql;

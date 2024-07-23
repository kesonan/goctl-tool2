import React, { useState } from "react";
import { Layout, Menu, MenuProps } from "antd";
import "./Model.css";
import { useTranslation } from "react-i18next";
import { ConverterIcon } from "../../../util/icon";
import { Outlet, useNavigate } from "react-router-dom";
import { MenuInfo, SelectInfo } from "rc-menu/lib/interface";

type MenuItem = Required<MenuProps>["items"][number];
const items: MenuItem[] = [
  {
    label: "MySQL",
    key: "/generator/model/mysql",
    icon: <ConverterIcon type={"icon-mysql"} />,
  },
  {
    label: "PostgreSQL",
    key: "/generator/model/postgresql",
    icon: <ConverterIcon type={"icon-postgresql"} />,
  },
];

const Model: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([
    "/generator/model/mysql",
  ]);
  const onClick: MenuProps["onClick"] = (info: MenuInfo) => {
    navigate(info.key);
  };
  const onSelect = (info: SelectInfo) => {
    setSelectedKeys(info.selectedKeys);
  };
  return (
    <Layout className="model">
      <Menu
        onClick={onClick}
        selectedKeys={selectedKeys}
        mode="horizontal"
        items={items}
        onSelect={onSelect}
        className={"model-container"}
      />
      <Outlet />
    </Layout>
  );
};

export default Model;

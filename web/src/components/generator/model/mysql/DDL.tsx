import React from "react";
import { Flex, GetProps, notification, Tree, Typography } from "antd";
import "./DDL.css";
import { useTranslation } from "react-i18next";

const { DirectoryTree } = Tree;
type DirectoryTreeProps = GetProps<typeof Tree.DirectoryTree>;
const { Text } = Typography;

export type Option = {
  label: string;
  value: string;
};

const DDL: React.FC = () => {
  const { t } = useTranslation();
  const [api, contextHolder] = notification.useNotification();

  return (
    <>
      <Flex>DDL</Flex>
    </>
  );
};

export default DDL;

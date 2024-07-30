import React, { useState } from "react";
import { Flex, Typography } from "antd";
import "./mysql/Datasource.css";
import { useTranslation } from "react-i18next";

const { Title } = Typography;

const Mysql: React.FC = () => {
  const { t } = useTranslation();
  const [code, setCode] = useState("");
  return (
    <div className="postgresql">
      <Flex style={{ height: "100vh" }}>postgresql</Flex>
    </div>
  );
};

export default Mysql;

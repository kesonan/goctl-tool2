import React, { useEffect, useState } from "react";
import {
  ExclamationCircleOutlined,
  GithubFilled,
  LeftOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Breadcrumb,
  Button,
  ConfigProvider,
  Flex,
  Layout,
  Menu,
  MenuProps,
  Tooltip,
  Typography,
} from "antd";
import "../../Base.css";
import "./App.css";
import { menuItems } from "./_defaultProps";
import zhCN from "antd/locale/zh_CN";
import enUS from "antd/locale/en_US";
import { ConverterIcon } from "../../util/icon";
import { useTranslation } from "react-i18next";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { MenuInfo, SelectInfo } from "rc-menu/lib/interface";
import { ItemType } from "antd/es/breadcrumb/Breadcrumb";
import logo from "../../assets/logo.svg";

const { Text, Link } = Typography;
const { Sider } = Layout;

const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [collapsed, setCollapsed] = useState(true);
  const [localeZH, setLocaleZh] = useState(false);
  const [locale, setLocale] = useState(zhCN);
  const [breadcrumbItems, setBreadcrumbItems] = useState<ItemType[]>([
    {
      key: "home",
      title: t("home"),
    },
  ]);
  const [openKeys, setOpenKeys] = useState<string[]>(["api"]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>();

  useEffect(() => {
    setLocaleZh(i18n.language !== "zh");
    const path = location.pathname;
    if (path !== "/") {
      const keys = path.split("/");
      if (keys.length > 1) {
        const openKey = keys[1];
        setOpenKeys([openKey]);
      }

      setSelectedKeys([keys[keys.length - 1]]);
      let breadcrumbItems: ItemType[] = [];
      keys.forEach((val: string) => {
        if (val !== "/" && val !== "") {
          breadcrumbItems.push({
            key: val,
            title: t(val),
          });
        } else {
          breadcrumbItems.push({
            key: "home",
            title: t("home"),
          });
        }
      });
      setBreadcrumbItems(breadcrumbItems);
    }
  }, []);

  const onLocaleClick = () => {
    const isZH = !localeZH;
    setLocaleZh(isZH);
    if (isZH) {
      i18n.changeLanguage("en");
      setLocale(zhCN);
    } else {
      i18n.changeLanguage("zh");
      setLocale(enUS);
    }
    let breadcrumbLocalItems: ItemType[] = [];
    breadcrumbItems.forEach((item) => {
      breadcrumbLocalItems.push({
        key: item.key,
        title: t(item.key as string),
      });
    });
    setBreadcrumbItems(breadcrumbLocalItems);
  };

  const onCollapsedClick = () => {
    setCollapsed(!collapsed);
  };
  const renderSiderFooter = () => {
    if (collapsed) {
      return <></>;
    }
    if (localeZH) {
      return (
        <>
          <Tooltip title={t("siderFooterLocale")}>
            <Button className="locale-btn" onClick={onLocaleClick}>
              中
            </Button>
          </Tooltip>
          <Link href="https://go-zero.dev" target="_blank">
            <Tooltip title={t("siderFooterDoc")}>
              <ConverterIcon
                type={"icon-document"}
                className="sider-footer-icon"
              />
            </Tooltip>
          </Link>
          <Link
            href="https://github.com/zeromicro/goctl-tool/issues/new"
            target="_blank"
          >
            <Tooltip title={t("siderFooterFeedback")}>
              <ExclamationCircleOutlined className="sider-footer-icon" />
            </Tooltip>
          </Link>
        </>
      );
    }
    return (
      <>
        <Tooltip title={t("siderFooterLocale")}>
          <Button className="locale-btn" onClick={onLocaleClick}>
            EN
          </Button>
        </Tooltip>
        <Link href="https://go-zero.dev" target="_blank">
          <Tooltip title={t("siderFooterDoc")}>
            <ConverterIcon
              type={"icon-document"}
              className="sider-footer-icon"
            />
          </Tooltip>
        </Link>
        <Link
          href="https://github.com/zeromicro/goctl-tool/issues/new"
          target="_blank"
        >
          <Tooltip title={t("siderFooterFeedback")}>
            <ExclamationCircleOutlined className="sider-footer-icon" />
          </Tooltip>
        </Link>
      </>
    );
  };

  const onOpenChange: MenuProps["onOpenChange"] = (openKeys) => {
    setOpenKeys(openKeys);
  };

  const onSelect = (info: SelectInfo) => {
    setSelectedKeys(info.selectedKeys);
  };
  return (
    <ConfigProvider
      locale={locale}
      theme={{
        token: {
          colorPrimary: "#000000",
          colorInfo: "#000000",
        },
        components: {
          Input: {
            activeShadow: "transparent",
          },
          InputNumber: {
            activeShadow: "transparent",
          },
          Select: {
            optionSelectedBg: "rgba(0, 0, 0, 0.04)",
          },
        },
      }}
    >
      <Layout hasSider>
        <Sider
          trigger={null}
          collapsible
          breakpoint={"xl"}
          defaultChecked={true}
          onBreakpoint={(broken) => {
            setCollapsed(broken);
          }}
          collapsed={collapsed}
          theme={"light"}
          width={256}
          collapsedWidth={66}
          style={{
            background: "#fafafa",
          }}
        >
          <Flex
            wrap
            gap={10}
            style={{
              height: "60px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              padding: "10px 0",
              background: "#fafafa",
            }}
          >
            <Avatar src={<img src={logo} alt="avatar" />} size={30} />
            {collapsed ? (
              <></>
            ) : (
              <Text ellipsis className={"logo-text-gradient"}>
                {t("logoText")}
              </Text>
            )}
          </Flex>
          <div
            style={{ height: "1px", background: "#f1f1f1", margin: "0 20px" }}
          />
          <ConfigProvider
            theme={{
              components: {
                Menu: {
                  itemSelectedBg: "#ebebeb",
                  itemSelectedColor: "rgba(0, 0, 0, 0.88)",
                  itemMarginInline: 20,
                  itemMarginBlock: 8,
                  activeBarBorderWidth: 0,
                  itemActiveBg: "#d0d0d0",
                  subMenuItemBg: "#fafafa",
                },
              },
            }}
          >
            <Menu
              style={{
                height: "calc(100vh - 160px)",
                overflowY: "auto",
                padding: "20px 0",
                background: "#fafafa",
              }}
              theme="light"
              mode="inline"
              items={menuItems(t)}
              // defaultOpenKeys={openKeys}
              openKeys={openKeys}
              selectedKeys={selectedKeys}
              onOpenChange={onOpenChange}
              onSelect={onSelect}
              onClick={(info: MenuInfo) => {
                let breadcrumbItems: ItemType[] = [];
                if (info.key !== "/") {
                  breadcrumbItems.push({
                    key: "home",
                    title: t("home"),
                  });
                }
                const reverseArray = info.keyPath.reverse();
                reverseArray.forEach((val: string) => {
                  if (val !== "/") {
                    breadcrumbItems.push({
                      key: val,
                      title: t(val),
                    });
                  }
                });
                setBreadcrumbItems(breadcrumbItems);
                const path = reverseArray.join("/");
                navigate(path);
              }}
            />
          </ConfigProvider>
          <Flex
            vertical
            justify="center"
            align="center"
            gap={10}
            style={{ height: "100px", background: "white", padding: "0 20px" }}
          >
            <Flex justify="center" align="center" gap={20}>
              <Link href="https://github.com/zeromicro/go-zero" target="_blank">
                <GithubFilled className="sider-footer-icon" />
              </Link>
              {renderSiderFooter()}
            </Flex>
            {collapsed ? (
              <></>
            ) : (
              <Text style={{ color: "#333333", fontSize: 12 }} ellipsis>
                go-zero ©{new Date().getFullYear()} Created by zeromicro
              </Text>
            )}
          </Flex>
        </Sider>

        <div style={{ height: "100vh", width: "1px", background: "#ebebeb" }} />

        {collapsed ? (
          <LeftOutlined
            className="collapse-button-uncollapsed"
            onClick={onCollapsedClick}
          />
        ) : (
          <LeftOutlined
            className="collapse-button-collapsed"
            onClick={onCollapsedClick}
          />
        )}
        <Layout style={{ height: "100vh", overflowY: "scroll" }}>
          <Breadcrumb
            items={breadcrumbItems}
            style={{
              marginTop: 22,
              marginLeft: 16,
            }}
          />
          <Outlet />
        </Layout>
      </Layout>
    </ConfigProvider>
  );
};

export default App;

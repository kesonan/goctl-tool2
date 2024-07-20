import React, { useEffect, useState } from "react";
import {
  Flex,
  Form,
  Input,
  Select,
  Modal,
  notification,
  Switch,
  Tooltip,
  Radio,
  RadioChangeEvent,
  type GetRef,
} from "antd";
import { CloseOutlined, SettingOutlined } from "@ant-design/icons";
import { FormListFieldData, FormListOperation } from "antd/es/form/FormList";
import { useTranslation } from "react-i18next";
import { RoutePanelData } from "./_defaultProps";
import RequestFieldModal from "./RequestFieldModal";

type FormInstance<T> = GetRef<typeof Form<T>>;

interface RequestFieldPanelProps {
  routeGroupField: FormListFieldData;
  requestBodyField: FormListFieldData;
  requestBodyOpt: FormListOperation;
  routeField: FormListFieldData;
  form: FormInstance<any>;
}

const RequestFieldPanel: React.FC<
  RequestFieldPanelProps & React.RefAttributes<HTMLDivElement>
> = (props) => {
  const { t } = useTranslation();
  const form = props.form;
  const routeGroupField = props.routeGroupField;
  const routeField = props.routeField;
  const requestBodyField = props.requestBodyField;
  const requestBodyOpt = props.requestBodyOpt;
  const [modalOpen, setModalOpen] = useState(false);
  useState<FormListFieldData>();
  const [modalData, setModalData] = useState({});

  return (
    <div key={requestBodyField.key}>
      <RequestFieldModal
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
        }}
        data={modalData}
        onDataUpdate={(data) => {
          let routeGroups = form.getFieldValue("routeGroups");
          if (!routeGroups) {
            return;
          }
          let routeGroup = routeGroups[routeGroupField.key];
          if (!routeGroup) {
            return;
          }
          let route = routeGroup.routes[routeField.key];
          if (!route) {
            return;
          }
          route.requestBodyFields[requestBodyField.key] = data;
          form.setFieldValue("routeGroups", routeGroups);
          setModalOpen(false);
        }}
      />

      <Flex align={"center"} key={requestBodyField.key} gap={6} wrap>
        <Form.Item
          label={t("formRequestBodyFieldNameTitle")}
          name={[requestBodyField.name, "name"]}
          style={{ flex: 1 }}
          tooltip={t("formRequestBodyFieldNameTooltip")}
          rules={[
            {
              required: true,
              message: `${t("formInputPrefix")}${t("formRequestBodyFieldNameTitle")}`,
            },
            {
              pattern: RoutePanelData.IDPattern,
              message: `${t("formRequestBodyFieldNameTitle")}${t("formRegexTooltip")}: ${RoutePanelData.IDPattern}`,
            },
          ]}
        >
          <Input
            allowClear
            placeholder={`${t("formInputPrefix")}${t("formRequestBodyFieldNameTitle")}`}
          />
        </Form.Item>
        <Form.Item
          label={t("formRequestBodyFieldTypeTitle")}
          name={[requestBodyField.name, "type"]}
          style={{ flex: 1 }}
          rules={[
            {
              required: true,
              message: `${t("formInputPrefix")}${t("formRequestBodyFieldTypeTitle")}`,
            },
          ]}
        >
          <Select
            allowClear
            placeholder={`${t("formInputPrefix")}${t("formRequestBodyFieldTypeTitle")}`}
            options={RoutePanelData.GolangTypeOptions}
            showSearch
          />
        </Form.Item>
        <Tooltip title={t("formRequestBodySettings")}>
          <SettingOutlined
            style={{
              padding: 4,
              border: "dashed 1px #c1c1c1",
              marginTop: 4,
            }}
            onClick={() => {
              let routeGroups = form.getFieldValue("routeGroups");
              if (!routeGroups) {
                return;
              }
              let routeGroup = routeGroups[routeGroupField.key];
              if (!routeGroup) {
                return;
              }
              let route = routeGroup.routes[routeField.key];
              if (!route) {
                return;
              }
              let field = route.requestBodyFields[requestBodyField.key];
              if (!field) {
                return;
              }
              setModalData(field);
              setModalOpen(true);
            }}
          />
        </Tooltip>
        <CloseOutlined
          onClick={() => {
            requestBodyOpt.remove(requestBodyField.name);
          }}
        />
      </Flex>
    </div>
  );
};

export default RequestFieldPanel;

import type { CertInfo } from "@/lib/api";
import { api } from "@/lib/api-client";
import { formatTimestamp } from "@/lib/format";
import { DataList } from "@chakra-ui/react";
import { useState } from "react";
import { useEffectOnce } from "react-use";

export default function CertInfoWidget() {
  const [certInfo, setCertInfo] = useState<CertInfo | null>(null);
  useEffectOnce(() => {
    api.cert.info().then((e) => setCertInfo(e.data));
  });
  if (!certInfo) return null;
  return (
    <DataList.Root orientation="horizontal">
      <DataList.Item>
        <DataList.ItemLabel>Subject</DataList.ItemLabel>
        <DataList.ItemValue>{certInfo.subject}</DataList.ItemValue>
      </DataList.Item>
      <DataList.Item>
        <DataList.ItemLabel>Issuer</DataList.ItemLabel>
        <DataList.ItemValue>{certInfo.issuer}</DataList.ItemValue>
      </DataList.Item>
      <DataList.Item>
        <DataList.ItemLabel>Registration</DataList.ItemLabel>
        <DataList.ItemValue>
          {formatTimestamp(certInfo.not_before)}
        </DataList.ItemValue>
      </DataList.Item>
      <DataList.Item>
        <DataList.ItemLabel>Expiry</DataList.ItemLabel>
        <DataList.ItemValue>
          {formatTimestamp(certInfo.not_after)}
        </DataList.ItemValue>
      </DataList.Item>
      {certInfo.dns_names &&
        certInfo.dns_names.map((name, i) => (
          <DataList.Item key={name}>
            <DataList.ItemLabel>DNS name {i + 1}</DataList.ItemLabel>
            <DataList.ItemValue>{name}</DataList.ItemValue>
          </DataList.Item>
        ))}
      {certInfo.email_addresses && (
        <DataList.Item>
          <DataList.ItemLabel>Email addresses</DataList.ItemLabel>
          <DataList.ItemValue>
            {certInfo.email_addresses.join(", ")}
          </DataList.ItemValue>
        </DataList.Item>
      )}
    </DataList.Root>
  );
}

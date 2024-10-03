import { Card, CardBody } from "@nextui-org/card";
import Image from "next/image";
import { useEffect, useState } from "react";

import { HomepageItem } from "@/types/homepage_item";

export default function AppCard({ item }: { readonly item: HomepageItem }) {
  const [iconElement, setIconElement] = useState<JSX.Element | null>(null);

  useEffect(() => {
    if (item.icon.startsWith("http")) {
      setIconElement(
        <Image
          alt={item.name}
          height={24}
          layout="fixed"
          src={item.icon}
          width={24}
        />,
      );
    } else {
      setIconElement(<span className="text-xl shrink-0">{item.icon}</span>);
    }
  }, [item.icon]);

  return (
    <a
      className="w-full bg-default-50 rounded-lg shadow-md transition-transform transform hover:scale-105"
      href={item.url}
      rel="noopener noreferrer"
      target="_blank"
    >
      <Card className="p-1">
        <CardBody>
          <div className="flex items-center space-x-2">
            <div>{iconElement}</div>
            <div className="flex flex-col">
              <span className="font-medium text-medium">{item.name}</span>
              {item.description && (
                <span className="text-sm text-gray-600">
                  {item.description}
                </span>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </a>
  );
}

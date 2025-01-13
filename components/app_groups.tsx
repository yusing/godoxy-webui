import AppCard from "@/components/app_card";
import { getHomepageItems, HomepageItems } from "@/types/homepage_item";
import { Grid2 as Grid } from "@mui/material";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function AppGroups() {
  const [homepageItems, setHomepageItems] = useState<HomepageItems>({});

  useEffect(() => {
    getHomepageItems()
      .then((items) => {
        setHomepageItems(items);
      })
      .catch((error) => toast.error(error));
  }, []);

  return (
    <Card className="w-full dark:bg-transparent light:bg-current dark:shadow-none light:shadow-md">
      {Object.entries(homepageItems).map(([category, items]) => (
        <Card
          key={`app-category-${category}`}
          className="mb-4 overflow-hidden"
          shadow="none"
        >
          <CardHeader>
            <h2
              className="text-2xl font-bold"
              style={{ paddingLeft: 16, paddingTop: 8 }}
            >
              {category}
            </h2>
          </CardHeader>
          <CardBody className="p-0 mx-2 my-0 overflow-hidden">
            <Grid container columnSpacing={4} rowSpacing={3}>
              {items.map((data) => (
                <Grid
                  key={data.alias}
                  size={{
                    xs: 8,
                    sm: 5,
                    md: 4,
                    lg: 3,
                    xl: 3,
                  }}
                >
                  <AppCard item={data} />
                </Grid>
              ))}
            </Grid>
          </CardBody>
        </Card>
      ))}
    </Card>
  );
}

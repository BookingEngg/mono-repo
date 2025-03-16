// Module
import React from "react";
import { motion } from "framer-motion";
// Rsuite
import { Panel, Avatar, Grid, Row, Col, Badge } from "rsuite";
// Services
import { getSummaryDetails } from "@/services/Home.service";

export interface ISummaryPayload {
  first_name: string;
  last_name: string;
  user_profile_picture: string;
  email: string;
  summary_cards: {
    label: string;
    value: string;
  }[];
}

const DashboardHome = () => {
  const [summaryData, setSummaryData] = React.useState<ISummaryPayload | null>(
    null
  );
  const [greeting, setGreeting] = React.useState("");

  React.useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    const fetchSummaryDetails = async () => {
      const response = await getSummaryDetails();
      setSummaryData(response.data);
    };

    fetchSummaryDetails();
  }, []);

  if (!summaryData) return <></>;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4"
    >
      <Grid fluid>
        <Row>
          <Col xs={24} md={12}>
            <Panel className="shadow-lg p-4 rounded-xl">
              <h2 className="text-xl md:text-2xl font-semibold">
                {greeting}, {summaryData.first_name}
              </h2>
              <p className="text-gray-500">Welcome back to EAPC</p>
            </Panel>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col xs={24} md={8}>
            <Panel className="flex flex-col items-center p-4">
              <Avatar circle size="lg" src={summaryData.user_profile_picture} />
              <h3 className="mt-2 text-lg font-medium">
                {summaryData?.first_name} {summaryData?.last_name}
              </h3>
              <p className="text-gray-500">{summaryData.email}</p>
            </Panel>
          </Col>
        </Row>

        <Row className="mt-4">
          {summaryData.summary_cards.map((card_details) => (
            <Col xs={24} md={8}>
              <Panel>
                <h4 className="text-lg font-semibold">{card_details.label}</h4>
                <Badge content={card_details.value} />
              </Panel>
            </Col>
          ))}
        </Row>
      </Grid>
    </motion.div>
  );
};

export default DashboardHome;

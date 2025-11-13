// Module
import React from "react";
import { motion } from "framer-motion";
// Rsuite
import { Panel, Avatar, Loader } from "rsuite";
// Services
import { getSummaryDetails } from "@/services/Home.service";
// Style
import style from "./Home.module.scss";
import classNames from "classnames/bind";
const cx = classNames.bind(style);

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
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    const fetchSummaryDetails = async () => {
      try {
        setLoading(true);
        const response = await getSummaryDetails();
        setSummaryData(response.data);
      } catch (error) {
        console.error("Failed to fetch summary details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryDetails();
  }, []);

  if (loading) {
    return (
      <div className={cx("loading-container")}>
        <Loader size="lg" content="Loading..." />
      </div>
    );
  }

  if (!summaryData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cx("home-container")}
    >
      {/* Combined Welcome & Profile Section */}
      <div className={cx("hero-section")}>
        <Panel className={cx("hero-card")}>
          <div className={cx("hero-content")}>
            <h1 className={cx("greeting-title")}>
              {greeting}, {summaryData.first_name}!
            </h1>
            <p className={cx("greeting-subtitle")}>Welcome back to EAPC</p>
          </div>
        </Panel>

        <Panel className={cx("profile-card")}>
          <div className={cx("profile-content")}>
            <Avatar
              circle
              size="lg"
              src={summaryData.user_profile_picture}
              alt={`${summaryData.first_name} ${summaryData.last_name}`}
              className={cx("profile-avatar")}
            />
            <div className={cx("profile-info")}>
              <h3 className={cx("profile-name")}>
                {summaryData.first_name} {summaryData.last_name}
              </h3>
              <p className={cx("profile-email")}>{summaryData.email}</p>
            </div>
          </div>
        </Panel>
      </div>

      {/* Summary Cards Section */}
      <div className={cx("summary-section")}>
        <h2 className={cx("section-title")}>Summary</h2>
        <div className={cx("summary-grid")}>
          {summaryData.summary_cards.map((card_details, index) => (
            <motion.div
              key={`${card_details.label}-${index}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Panel className={cx("summary-card")}>
                <div className={cx("card-content")}>
                  <h4 className={cx("card-label")}>{card_details.label}</h4>
                  <div className={cx("card-value")}>{card_details.value}</div>
                </div>
              </Panel>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardHome;

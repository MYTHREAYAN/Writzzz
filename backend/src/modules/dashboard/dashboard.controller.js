const asyncHandler = require("../../utils/asyncHandler");
const { success } = require("../../utils/apiResponse");
const { getDashboardData } = require("./dashboard.service");

const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const dashboardData = await getDashboardData(userId);

  return success(res, {
    status: 200,
    message: "Dashboard data retrieved successfully",
    data: dashboardData,
  });
});

module.exports = { getDashboard };

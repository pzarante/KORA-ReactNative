// babel-preset-expo inlines EXPO_PUBLIC_* at transform time, so tests must set them before Jest transforms any file.
module.exports = () => {
  process.env.EXPO_PUBLIC_ROBLE_PROJECT_ID ||= "test_project_id";
};

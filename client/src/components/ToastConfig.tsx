import { BaseToast, ErrorToast } from "react-native-toast-message";

export const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: "green" }}
      text1Style={{ fontSize: 16, fontWeight: "bold" }}
    />
  ),
  error: (props: any) => (
    <ErrorToast {...props} style={{ borderLeftColor: "red" }} />
  ),
};

"use client";

import mitt from "mitt";

export type ToastInfo = {
  code: number;
  message: string;
};

export type MittEvent = {
  ToastError: ToastInfo;
  ToastSuccess: ToastInfo;
};
const emitter = mitt<MittEvent>();

export { emitter };

const prefix = 'http://localhost:8080/backend/api/v1/platform'

export const sendOtp = async () => {
  return await fetch(`${prefix}/user/otp/create`, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({contact: "9990870405"}),
    method: "POST",
    mode: 'cors'
  })
}

export const verifyOtp = async (otp: number) => {
  return await fetch(`${prefix}/user/otp/verify`, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({contact: "9990870405", otp}),
    method: "POST",
    mode: 'cors',
    credentials: "include"
  })
}


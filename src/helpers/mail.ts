import nodeMailer from 'nodemailer'

const transporter = nodeMailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
  }
})

export const sendMail = async (credentials: any) => {
  try {
    if (credentials.type === 'OTP') {
      let info = await transporter.sendMail({
        from: process.env.EMAIL,
        to: credentials.to,
        subject: `Welcome`,
        html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
            <div style="margin:50px auto;width:70%;padding:20px 0">
                <div style="border-bottom:1px solid #eee">
                <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">ATRONS</a>
                </div>
                <p style="font-size:1.1em">Hi, ${credentials.to}</p>
                <h4>Please verify your email</h4>
                <p>Thank you for choosing the ATRONS Platform. Use the following Code to complete your Sign Up procedures.</p>
                <h4 style="background: #00466a;margin: 0 auto;width: max-content;padding: 10px 30px;color: #fff;border-radius: 4px;">
                ${credentials.OTP}
                </h4>
                <p style="font-size:0.9em;">Regards,<br />ATRONS</p>
                <hr style="border:none;border-top:1px solid #eee" />
                <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                <p>ATRONS Inc</p>
                <p>Addis Ababa</p>
                <p>Ethiopia</p>
                </div>
            </div>
        </div>`
      })
      return info
    }
    if (credentials.type === 'link') {
      let info = await transporter.sendMail({
        from: process.env.EMAIL,
        to: credentials.to,
        subject: `Welcome`,
        html: `<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
            <div style="margin:50px auto;width:70%;padding:20px 0">
                <div style="border-bottom:1px solid #eee">
                <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">ATRONS</a>
                </div>
                <p style="font-size:1.1em">Hi, ${credentials.to}</p>
                <h4>Please verify your email</h4>
                <p>Thank you for choosing ATRONS Platform. Use the following Code to complete your Sign Up procedures.</p>
                <p>Click the link below change your password</p>
                <a href = "${credentials.link}" style="margin: 0 auto;width: max-content;padding: 10px 30px;color: blue; text-decoration: none;">
                ${credentials.link}
                </a>
                <p style="font-size:0.9em;">Regards,<br />ATRONS</p>
                <hr style="border:none;border-top:1px solid #eee" />
                <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                <p>ATRONS Inc</p>
                <p>Addis Ababa</p>
                <p>Ethiopia</p>
                </div>
            </div>
        </div>`
      })

      return info
    }
  } catch (error) {
    return error
  }
}

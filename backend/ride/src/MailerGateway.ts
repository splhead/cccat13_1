export class MailerGateway {
  async send(email: string, subject: string, message: string) {
    console.log(email, subject, message)
  }
}

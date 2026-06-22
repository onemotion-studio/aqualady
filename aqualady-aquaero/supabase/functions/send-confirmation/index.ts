import "@supabase/functions-js/edge-runtime.d.ts";

interface BookingItem {
  poolName: string
  date: string
  time: string
  quantity: number
  price: number
}

console.log("Hello from send-confirmation!");

export default {
  fetch: async (req: Request) => {
    try {
      const { email, name, items, total } = await req.json()

      if (!email || !items || !items.length) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const poolNames: Record<string, string> = {
        fala: 'Basen Fala',
        aquapark: 'Aquapark Warszawa',
        sloneczny: 'Basen Sloneczny',
        wodnik: 'Basen Wodnik',
      }

      const formatDate = (dateStr: string) => {
        return dateStr.slice(8, 10) + '.' + dateStr.slice(5, 7) + '.' + dateStr.slice(0, 4)
      }

      const formatTime = (timeValue: string) => {
        const hour = timeValue.replace('slot_', '')
        const h = parseInt(hour.slice(0, 2))
        if (!isNaN(h)) return `${h}:00 - ${h + 1}:00`
        return timeValue
      }

      const itemsHtml = items.map((item: BookingItem) => {
        const pool = poolNames[item.poolName] || item.poolName
        return `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; font-size: 14px;">${pool}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; font-size: 14px;">${formatDate(item.date)}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; font-size: 14px;">${formatTime(item.time)}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; font-size: 14px; text-align: center;">${item.quantity}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; font-size: 14px; text-align: right;">${item.price} zł</td>
          </tr>
        `
      }).join('')

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, Helvetica, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #14b8a6; padding: 30px; text-align: center; border-radius: 16px 16px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: white; padding: 30px; border-radius: 0 0 16px 16px; }
            .footer { text-align: center; padding: 20px; color: #888; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; }
            th { text-align: left; padding: 10px 12px; background: #f0fdfa; color: #0f766e; font-size: 13px; border-bottom: 2px solid #14b8a6; }
            .total { font-size: 18px; font-weight: bold; color: #14b8a6; text-align: right; padding-top: 16px; }
            .info { background: #f0fdfa; padding: 16px; border-radius: 12px; margin: 20px 0; font-size: 13px; color: #333; }
            .info strong { color: #0f766e; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Aqualady Aquaero 🏊</h1>
              <p style="color: white; opacity: 0.9; margin: 8px 0 0;">Potwierdzenie rezerwacji</p>
            </div>
            <div class="content">
              <p style="font-size: 16px; margin-top: 0;">Cześć <strong>${name}</strong>!</p>
              <p style="font-size: 14px; color: #555;">Dziękujemy za rezerwację! Oto szczegóły:</p>

              <table>
                <thead>
                  <tr>
                    <th>Basen</th>
                    <th>Data</th>
                    <th>Godzina</th>
                    <th style="text-align: center;">Ilość</th>
                    <th style="text-align: right;">Cena</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div class="total">
                Razem: ${total} zł
              </div>

              <div class="info">
                <strong>📌 Co zabrać?</strong>
                <ul style="margin: 8px 0 0; padding-left: 20px;">
                  <li>Czepek kąpielowy</li>
                  <li>Strój kąpielowy / Kąpielówki</li>
                  <li>Klapki</li>
                </ul>
              </div>

              <p style="font-size: 13px; color: #888; margin-top: 20px;">
                ⏰ Prosimy o przybycie 10-15 minut przed zajęciami.
              </p>
              <p style="font-size: 13px; color: #888;">
                W razie pytań napisz do nas na WhatsApp.
              </p>
            </div>
            <div class="footer">
              <p>Aqualady Aquaero &copy; 2026</p>
              <p>Akwaaerobika dla seniorów &middot; Warszawa</p>
            </div>
          </div>
        </body>
        </html>
      `

      // Use Resend to send email
      const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

      if (!RESEND_API_KEY) {
        console.error('RESEND_API_KEY not set')
        return new Response(JSON.stringify({ error: 'Email service not configured' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Aqualady Aquaero <rezerwacje@aqualady.pl>',
          to: [email],
          subject: 'Potwierdzenie rezerwacji - Aqualady Aquaero',
          html,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        console.error('Resend error:', data)
        return new Response(JSON.stringify({ error: 'Failed to send email' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ success: true, id: data.id }), {
        headers: { 'Content-Type': 'application/json' },
      })

    } catch (err) {
      console.error('Function error:', err)
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  },
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { formId, data } = body

    if (!formId || !data) {
      return NextResponse.json(
        { error: 'formId e data são obrigatórios' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Get form details to validate and get profile_id
    const { data: formData, error: formError } = await supabase
      .from('forms')
      .select('id, profile_id, destination_email')
      .eq('id', formId)
      .single()

    if (formError || !formData) {
      return NextResponse.json(
        { error: 'Formulário não encontrado' },
        { status: 404 }
      )
    }

    // Get IP address and User Agent
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Insert submission
    const { data: submission, error: submissionError } = await supabase
      .from('form_submissions')
      .insert({
        form_id: formData.id,
        profile_id: formData.profile_id,
        data: data,
        ip_address: ip,
        user_agent: userAgent,
        read: false
      })
      .select()
      .single()

    if (submissionError) {
      console.error('Error inserting submission:', submissionError)
      return NextResponse.json(
        { error: 'Erro ao salvar resposta' },
        { status: 500 }
      )
    }

    // TODO: Send email notification if destination_email is set
    // if (formData.destination_email) {
    //   await sendEmailNotification(formData.destination_email, submission)
    // }

    return NextResponse.json(
      { 
        success: true, 
        submissionId: submission.id,
        message: 'Resposta enviada com sucesso' 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error in form submission:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

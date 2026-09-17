from django.conf import settings
from django.core.mail import send_mail
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Sends one test email using the current EMAIL_* settings — use this to debug email setup on its own, separate from checkout."

    def add_arguments(self, parser):
        parser.add_argument("to_email", help="Address to send the test email to, e.g. mumtazahmadfaheem@gmail.com")

    def handle(self, *args, **options):
        to_email = options["to_email"]

        self.stdout.write(f"EMAIL_BACKEND     = {settings.EMAIL_BACKEND}")
        self.stdout.write(f"EMAIL_HOST        = {getattr(settings, 'EMAIL_HOST', '(not set)')}")
        self.stdout.write(f"EMAIL_HOST_USER   = {settings.EMAIL_HOST_USER or '(blank)'}")
        self.stdout.write(f"EMAIL_HOST_PASSWORD set? = {bool(settings.EMAIL_HOST_PASSWORD)} (length {len(settings.EMAIL_HOST_PASSWORD or '')})")
        self.stdout.write(f"DEFAULT_FROM_EMAIL = {settings.DEFAULT_FROM_EMAIL}")

        if settings.EMAIL_BACKEND == "django.core.mail.backends.console.EmailBackend":
            self.stdout.write(self.style.WARNING(
                "\nStill using the CONSOLE backend — EMAIL_HOST_USER/EMAIL_HOST_PASSWORD "
                "aren't both set, or backend/.env isn't being found. The email below will "
                "just print, not actually send."
            ))

        self.stdout.write("\nSending test email...")
        try:
            send_mail(
                subject="JH Store — test email",
                message="If you're reading this in your inbox, email sending is working correctly.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[to_email],
                fail_silently=False,
            )
        except Exception as e:
            raise CommandError(f"FAILED to send: {e!r}")

        self.stdout.write(self.style.SUCCESS(f"Looks like it sent — check {to_email}'s inbox (and spam folder)."))

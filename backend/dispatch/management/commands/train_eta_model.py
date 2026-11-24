from django.core.management.base import BaseCommand

from dispatch.ml.eta_model import train_and_evaluate


class Command(BaseCommand):
    help = "Train and evaluate the scikit-learn ETA and delay-risk model."

    def add_arguments(self, parser):
        parser.add_argument(
            "--samples",
            type=int,
            default=3000,
            help="Number of synthetic Bengaluru corridor trips to generate.",
        )
        parser.add_argument(
            "--seed",
            type=int,
            default=42,
            help="Random seed for reproducible training and train/test split.",
        )

    def handle(self, *args, **options):
        metrics = train_and_evaluate(
            n_samples=options["samples"],
            seed=options["seed"],
            save_artifacts=True,
        )
        self.stdout.write(
            self.style.SUCCESS(
                "ETA model trained: "
                f"MAE={metrics['ml_mae_minutes']} min "
                f"(baseline={metrics['baseline_mae_minutes']} min, "
                f"improvement={metrics['mae_improvement_pct']}%), "
                f"RMSE={metrics['ml_rmse_minutes']} min, "
                f"R2={metrics['ml_r2']}"
            )
        )

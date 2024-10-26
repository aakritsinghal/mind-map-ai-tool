gcloud projects create mindmapp
gcloud projects create image_to_text
gcloud projects create imagetotext
gcloud projects create imagetotext123
gcloud config set project imagetotext123
gcloud services enable vision.googleapis.com
gcloud auth activate-service-account --key-file operations/acat.p2-646971525447-6420f172-0243-4523-b0d0-b40d2f20a274
gcloud services api-keys create --display-name=mindmappocrkey
gcloud iam service-accounts create sampleimage   --description="DESCRIPTION"   --display-name="ocrimagetext"
gcloud auth list
gcloud config list
gcloud info
gcloud auth login
gcloud config set project lunar-clone-439804-a2
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud builds submit --tag gcr.io/lunar-clone-439804-a2/django-app
ls
git init

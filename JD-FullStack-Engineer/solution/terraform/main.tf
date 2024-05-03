terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Configure the AWS Provider
provider "aws" {
  region = "us-east-1"
}

resource aws_vpc "joyn_vpc" {
  cidr_block = "172.30.0.0/16"
}

resource aws_subnet "joyn_subnet" {
  vpc_id     = aws_vpc.joyn_vpc.id
  cidr_block = "172.30.0.0/20"
  map_public_ip_on_launch = true
}

resource "aws_internet_gateway" "joyn_vpc_gateway" {
  vpc_id = aws_vpc.joyn_vpc.id
}

resource "aws_route_table" "joyn_route_table" {
  vpc_id = aws_vpc.joyn_vpc.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.joyn_vpc_gateway.id
 }
}

resource "aws_route_table_association" "public" {
   subnet_id   = aws_subnet.joyn_subnet.id
   route_table_id = aws_route_table.joyn_route_table.id
}

# security group
resource "aws_security_group" "joyn_sg" {
  name        = "joyn_sg"
  description = "joyn Sg"
  vpc_id      = aws_vpc.joyn_vpc.id
}

# security group ingress rule
resource "aws_vpc_security_group_ingress_rule" "allow_ssh" {
  security_group_id = aws_security_group.joyn_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 22
  ip_protocol       = "tcp"
  to_port           = 22
}
resource "aws_vpc_security_group_ingress_rule" "allow_http" {
  security_group_id = aws_security_group.joyn_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 80
  ip_protocol       = "tcp"
  to_port           = 80
}
resource "aws_vpc_security_group_ingress_rule" "allow_https" {
  security_group_id = aws_security_group.joyn_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 443
  ip_protocol       = "tcp"
  to_port           = 443
}
resource "aws_vpc_security_group_egress_rule" "allow_all_traffic_ipv4" {
  security_group_id = aws_security_group.joyn_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}

resource "aws_instance" "api_server" {
  ami           = "ami-04b70fa74e45c3917"
  instance_type = "t2.micro"
  vpc_security_group_ids = [aws_security_group.joyn_sg.id]
  subnet_id = aws_subnet.joyn_subnet.id
  depends_on = [aws_internet_gateway.joyn_vpc_gateway]
  key_name = "joyn-pair" // This associate a console-created key name to the instance.
  tags = {
    Name = "JoynAPIServerInstance"
  }
}

resource "aws_s3_bucket" "joyn_assets" {
  bucket = "joyn-assets"
  tags = {
    Name        = "Joyn public assets"
    Environment = "Dev"
  }
}

data "aws_iam_policy_document" "joyn_assets_policy_document" {
  statement {
    sid = "PublicReadGetObject"
    principals {
      type        = "*"
      identifiers = ["*"]
    }
    actions = [
      "s3:GetObject",
    ]

    resources = [
      aws_s3_bucket.joyn_assets.arn,
      "${aws_s3_bucket.joyn_assets.arn}/*",
    ]
  }
}

resource "aws_s3_bucket_policy" "joy_assets_public_access" {
  bucket = aws_s3_bucket.joyn_assets.id
  policy = data.aws_iam_policy_document.joyn_assets_policy_document.json
}

resource "aws_s3_bucket_public_access_block" "joyn_bucket_public_access" {
  bucket = aws_s3_bucket.joyn_assets.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_website_configuration" "joyn_client_assets" {
  bucket = aws_s3_bucket.joyn_assets.id

  index_document {
    suffix = "index.html"
  }
}



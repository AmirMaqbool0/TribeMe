"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Grid,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Typography,
  useMediaQuery,
  useTheme,
  Select,
  FormControl,
  InputLabel,
  Link as MuiLink,
  SelectChangeEvent,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import Link from "next/link";
import dynamic from "next/dynamic";
import "react-phone-input-2/lib/style.css";
import "./components/phoneInputStyles.css";
import { styled } from '@mui/material/styles';

const StyledFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
  '& .MuiFormControlLabel-asterisk': {
    display: 'none',
  },
}));


const PhoneInput = dynamic(() => import("react-phone-input-2"), { ssr: false });

interface FormData {
  businessName: string;
  category: string;
  subCategories: string[];
  businessEmail: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  zipCode: string;
  address: string;
  city: string;
  termsAgreed: boolean;
}

interface Category {
  id: string;
  name: string;
}

const Waitlist: React.FC = () => {
  const router = useRouter();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const [formData, setFormData] = useState<FormData>({
    businessName: "",
    category: "",
    subCategories: [],
    businessEmail: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    zipCode: "",
    address: "",
    city: "",
    termsAgreed: false,
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  const [loadingSubcategories, setLoadingSubcategories] =
    useState<boolean>(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
          console.error("Failed to fetch categories");
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!formData.category) {
        setSubcategories([]);
        return;
      }
      setLoadingSubcategories(true);
      try {
        const response = await fetch(`/api/subcategories/${formData.category}`);
        if (response.ok) {
          const data = await response.json();
          setSubcategories(
            data.map((item: { id: string; name: string }) => item.name)
          );
        } else {
          console.error("Failed to fetch subcategories");
        }
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      } finally {
        setLoadingSubcategories(false);
      }
    };
    fetchSubcategories();
  }, [formData.category]);

  // const handleChange = (
  //   e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  // ) => {
  //   setFormData({
  //     ...formData,
  //     [e.target.name]: e.target.value,
  //   });
  // };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubCategoriesChange = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;
    setFormData({
      ...formData,
      subCategories: typeof value === "string" ? value.split(",") : value,
    });
  };

  const handlePhoneChange = (phone: string) => {
    setFormData({
      ...formData,
      phoneNumber: phone,
    });
  };

  // const handleNextStep = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsVerifying(true);
  //   try {
  //     const response = await fetch("/api/send-otp", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ phoneNumber: formData.phoneNumber }),
  //     });

  //     if (response.ok) {
  //       setIsOtpSent(true);
  //       setCurrentStep(1);
  //     } else {
  //       const errorResult = await response.json();
  //       alert(errorResult.error || "Failed to send OTP. Please try again.");
  //     }
  //   } catch (error) {
  //     console.error("Error sending OTP:", error);
  //     alert("There was an error sending the OTP. Please try again later.");
  //   } finally {
  //     setIsVerifying(false);
  //   }
  // };

  // const handleNextStep = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsVerifying(true);
  //   try {
  //     // Ensure the phone number has the correct format
  //     let phoneNumber = formData.phoneNumber;
  //     if (!phoneNumber.startsWith("+")) {
  //       phoneNumber = `+${phoneNumber}`;
  //     }

  //     const response = await fetch("/api/send-otp", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ phoneNumber }),
  //     });

  //     if (response.ok) {
  //       setIsOtpSent(true);
  //       setCurrentStep(1);
  //     } else {
  //       const errorResult = await response.json();
  //       alert(errorResult.error || "Failed to send OTP. Please try again.");
  //     }
  //   } catch (error) {
  //     console.error("Error sending OTP:", error);
  //     alert("There was an error sending the OTP. Please try again later.");
  //   } finally {
  //     setIsVerifying(false);
  //   }
  // };
  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.termsAgreed) {
      alert("You must agree to the Terms of Service and Privacy Policy");
      return;
    }
    setIsVerifying(true);
    try {
      let phoneNumber = formData.phoneNumber;
      if (!phoneNumber.startsWith("+")) {
        phoneNumber = `+${phoneNumber}`;
      }

      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phoneNumber }),
      });

      if (response.ok) {
        setIsOtpSent(true);
        setCurrentStep(1);
      } else {
        const errorResult = await response.json();
        alert(errorResult.error || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("There was an error sending the OTP. Please try again later.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: formData.phoneNumber,
          otp: otp,
        }),
      });

      if (response.ok) {
        handleSubmit(e);
      } else {
        const errorResult = await response.json();
        alert(errorResult.error || "Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("There was an error verifying the OTP. Please try again later.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/waitlist/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        router.push("/RequestSent");
      } else {
        const errorResult = await response.json();
        alert(errorResult.error);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("There was an error submitting the form. Please try again later.");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "white",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: isSmallScreen ? "center" : "flex-start",
          mb: 4,
          mt: isSmallScreen ? 2 : 4,
          px: { xs: 2, md: 4 },
        }}
      >
        <Link href="/">
          <img
            src="/logo.svg"
            alt="Logo"
            style={{ width: 150, height: "auto" }}
          />
        </Link>
      </Box>

      {/* Main Content Section */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: { xs: "center", md: "flex-start" },
          position: "relative",
          px: { xs: 2, md: 4 },
        }}
      >
        {/* Form Section */}
        <Box
          sx={{
            width: { xs: "100%", md: "60%" },
            maxWidth: "600px",
            height: "auto",
            zIndex: 1,
            ml: { md: 16 },
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              mb: 2,
              fontFamily: "sans-serif",
              fontWeight: "bold",
              color: "black",
              textAlign: { xs: "center", sm: "left", xl: "left" },
              fontSize: { xs: "1.5rem", xl: "2rem" },
            }}
          >
            Join Our Beta Waitlist
          </Typography>

          <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
            <Step>
              <StepLabel>Business Information</StepLabel>
            </Step>
            <Step>
              <StepLabel>Verify Phone</StepLabel>
            </Step>
          </Stepper>

          {currentStep === 0 ? (
            <Box
              component="form"
              onSubmit={handleNextStep}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Business Name"
                    name="businessName"
                    fullWidth
                    required
                    value={formData.businessName}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Category"
                    name="category"
                    select
                    fullWidth
                    required
                    value={formData.category}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        category: e.target.value,
                        subCategories: [],
                      });
                    }}
                  >
                    {loadingCategories ? (
                      <MenuItem disabled>Loading categories...</MenuItem>
                    ) : (
                      categories.map((cat) => (
                        <MenuItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </MenuItem>
                      ))
                    )}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Sub-Categories (Select up to 2)</InputLabel>
                    <Select
                      multiple
                      value={formData.subCategories}
                      onChange={handleSubCategoriesChange}
                      renderValue={(selected) =>
                        (selected as string[]).join(", ")
                      }
                      disabled={loadingSubcategories || !formData.category}
                    >
                      {loadingSubcategories ? (
                        <MenuItem disabled>Loading subcategories...</MenuItem>
                      ) : (
                        subcategories.map((sub, index) => (
                          <MenuItem
                            key={index}
                            value={sub}
                            disabled={
                              formData.subCategories.length >= 2 &&
                              !formData.subCategories.includes(sub)
                            }
                          >
                            {sub}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Business Email"
                    type="email"
                    name="businessEmail"
                    fullWidth
                    required
                    value={formData.businessEmail}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="First Name"
                    name="firstName"
                    fullWidth
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Last Name"
                    name="lastName"
                    fullWidth
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <PhoneInput
                    country={"us"}
                    value={formData.phoneNumber}
                    onChange={handlePhoneChange}
                    inputProps={{
                      name: "phoneNumber",
                      required: true,
                      className: "form-control",
                    }}
                    containerClass="phone-input-wrapper"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Zip Code"
                    name="zipCode"
                    fullWidth
                    required
                    value={formData.zipCode}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Address"
                    name="address"
                    fullWidth
                    required
                    value={formData.address}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="City"
                    name="city"
                    fullWidth
                    required
                    value={formData.city}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12}>

<StyledFormControlLabel
  control={<Checkbox 
    required
    name="termsAgreed"
    checked={formData.termsAgreed}
    onChange={handleChange}
    />}
  label={
    <Typography className="text-black">
      I agree to the{' '} 
      <MuiLink
        href="/terms"
        target="_blank"
        className="text-pink underline"
      >
        Terms of Service
      </MuiLink>
      {' '}and{' '}
      <MuiLink
        href="/privacy"
        target="_blank"
        className="text-pink underline"
      >
        Privacy Policy
      </MuiLink>
    </Typography>
  }
  required
/>
</Grid>
              </Grid>

              <Button
                variant="contained"
                type="submit"
                fullWidth
                disabled={isVerifying}
                sx={{
                  backgroundColor: "rgb(255, 57, 81)",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "rgb(255, 57, 81, 0.8)",
                  },
                  my: 2,
                  borderRadius: "8px",
                }}
              >
                {isVerifying ? "Sending OTP..." : "Next Step"}
              </Button>
            </Box>
          ) : (
            <Box
              component="form"
              onSubmit={handleVerifyOtp}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              <Typography variant="body1" sx={{ mb: 2 }}>
                We've sent a verification code to {formData.phoneNumber}. Please
                enter it below.
              </Typography>
              <TextField
                label="Verification Code"
                type="text"
                fullWidth
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                type="submit"
                fullWidth
                disabled={isVerifying}
                sx={{
                  backgroundColor: "rgb(255, 57, 81)",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "rgb(255, 57, 81, 0.8)",
                  },
                  borderRadius: "8px",
                }}
              >
                {isVerifying ? "Verifying..." : "Verify & Submit"}
              </Button>
              <Button
                variant="text"
                onClick={() => setCurrentStep(0)}
                sx={{ mt: 1 }}
              >
                Back to Step 1
              </Button>
            </Box>
          )}
        </Box>

        {/* Right Image Section */}
        <Box
          sx={{
            display: { xs: "none", md: "block" },
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: "40%",
            height: "100%",
            zIndex: 0,
          }}
        >
          <img
            src="/waitlist.svg"
            alt="Waitlist"
            style={{
              width: "100%",
              height: "auto",
              objectFit: "cover",
              objectPosition: "left center",
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Waitlist;